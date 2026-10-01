import * as Y from "yjs";
import * as syncProtocol from "y-protocols/dist/sync.cjs";
import * as awarenessProtocol from "y-protocols/dist/awareness.cjs";
import * as encoding from "lib0/dist/encoding.cjs";
import * as decoding from "lib0/dist/decoding.cjs";
import { WebSocket } from "ws";
import { createChatMessage } from "../services/chat.service";
import { broadcastToRoom } from "./presence.handler";

const messageSync = 0;
const messageAwareness = 1;
const messageChat = 2;
const messageQueryAwareness = 3;

interface WSSharedDoc extends Y.Doc {
  name: string;
  conns: Map<WebSocket, Set<number>>;
  awareness: awarenessProtocol.Awareness;
}

const docs = new Map<string, WSSharedDoc>();

export function getYDoc(docName: string, gc: boolean = true): WSSharedDoc {
  let doc = docs.get(docName);
  if (!doc) {
    doc = new Y.Doc({ gc }) as WSSharedDoc;
    doc.name = docName;
    doc.conns = new Map();
    doc.awareness = new awarenessProtocol.Awareness(doc);
    doc.awareness.setLocalState(null);

    const awarenessChangeHandler = (
      {
        added,
        updated,
        removed,
      }: { added: number[]; updated: number[]; removed: number[] },
      conn: any
    ) => {
      const changedClients = added.concat(updated, removed);
      const connDoc = docs.get(docName);
      if (connDoc) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageAwareness);
        encoding.writeVarUint8Array(
          encoder,
          awarenessProtocol.encodeAwarenessUpdate(
            connDoc.awareness,
            changedClients
          )
        );
        const buff = encoding.toUint8Array(encoder);
        connDoc.conns.forEach((_, c) => {
          send(connDoc!, c, buff);
        });
      }
    };

    doc.awareness.on("update", awarenessChangeHandler);

    doc.on("update", (update: Uint8Array, origin: any) => {
      const connDoc = docs.get(docName);
      if (!connDoc) return;
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const buff = encoding.toUint8Array(encoder);
      connDoc.conns.forEach((_, c) => {
        if (c !== origin) {
          send(connDoc, c, buff);
        }
      });
    });

    docs.set(docName, doc);
  }
  return doc;
}

function send(doc: WSSharedDoc, conn: WebSocket, m: Uint8Array) {
  if (
    conn.readyState !== WebSocket.OPEN &&
    conn.readyState !== WebSocket.CONNECTING
  ) {
    closeConn(doc, conn);
    return;
  }
  try {
    conn.send(m, { binary: true }, (err) => {
      if (err) {
        closeConn(doc, conn);
      }
    });
  } catch (e) {
    closeConn(doc, conn);
  }
}

function closeConn(doc: WSSharedDoc, conn: WebSocket) {
  if (doc.conns.has(conn)) {
    const controlledIds = doc.conns.get(conn)!;
    doc.conns.delete(conn);
    awarenessProtocol.removeAwarenessStates(
      doc.awareness,
      Array.from(controlledIds),
      null
    );
    if (doc.conns.size === 0) {
      doc.destroy();
      docs.delete(doc.name);
    }
  }
  try {
    conn.close();
  } catch (e) {}
}

export function handleYjsConnection(
  conn: WebSocket,
  roomId: string,
  user: { id: string; name: string; email: string }
) {
  conn.binaryType = "arraybuffer";
  const doc = getYDoc(roomId);
  doc.conns.set(conn, new Set());

  // Listen to messages
  conn.on("message", async (message: any, isBinary: boolean) => {
    // If binary message -> Yjs / Awareness / Chat binary protocol
    if (isBinary || message instanceof ArrayBuffer || message instanceof Uint8Array || Buffer.isBuffer(message)) {
      try {
        const uint8 = new Uint8Array(message);
        const decoder = decoding.createDecoder(uint8);
        const messageType = decoding.readVarUint(decoder);

        switch (messageType) {
          case messageSync: {
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, messageSync);
            syncProtocol.readSyncMessage(decoder, encoder, doc, conn);
            if (encoding.length(encoder) > 1) {
              send(doc, conn, encoding.toUint8Array(encoder));
            }
            break;
          }
          case messageAwareness: {
            awarenessProtocol.applyAwarenessUpdate(
              doc.awareness,
              decoding.readVarUint8Array(decoder),
              conn
            );
            break;
          }
          case messageChat: {
            const content = (decoding as any).readVarString(decoder);
            if (content && content.trim()) {
              try {
                const savedMessage = await createChatMessage(
                  roomId,
                  user.id,
                  content.trim()
                );

                // Broadcast binary chat frame to all clients connected to this room doc
                const chatEncoder = encoding.createEncoder();
                encoding.writeVarUint(chatEncoder, messageChat);
                (encoding as any).writeVarString(
                  chatEncoder,
                  JSON.stringify(savedMessage)
                );
                const chatBuff = encoding.toUint8Array(chatEncoder);

                doc.conns.forEach((_, c) => {
                  send(doc, c, chatBuff);
                });

                // Also broadcast JSON payload to any room listeners
                broadcastToRoom(roomId, {
                  type: "MESSAGE_CHAT",
                  data: savedMessage,
                });
              } catch (chatDbErr) {
                console.error("Error creating/saving chat message:", chatDbErr);
              }
            }
            break;
          }
          case messageQueryAwareness: {
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, messageAwareness);
            encoding.writeVarUint8Array(
              encoder,
              awarenessProtocol.encodeAwarenessUpdate(
                doc.awareness,
                Array.from(doc.awareness.getStates().keys())
              )
            );
            send(doc, conn, encoding.toUint8Array(encoder));
            break;
          }
        }
      } catch (err) {
        console.error("Yjs binary message error:", err);
      }
      return;
    }

    // If text message -> JSON protocol fallback (Chat, Ping/Pong)
    try {
      const text = typeof message === "string" ? message : message.toString("utf8");
      const data = JSON.parse(text);

      if (data.type === "MESSAGE_CHAT" || data.type === "chat") {
        const content = data.content || data.text || "";
        if (content.trim()) {
          const savedMessage = await createChatMessage(roomId, user.id, content.trim());

          // Broadcast binary to doc connections
          const chatEncoder = encoding.createEncoder();
          encoding.writeVarUint(chatEncoder, messageChat);
          (encoding as any).writeVarString(
            chatEncoder,
            JSON.stringify(savedMessage)
          );
          const chatBuff = encoding.toUint8Array(chatEncoder);
          doc.conns.forEach((_, c) => {
            send(doc, c, chatBuff);
          });

          // Also broadcast JSON to room sockets
          broadcastToRoom(roomId, {
            type: "MESSAGE_CHAT",
            data: savedMessage,
          });
        }
      } else if (data.type === "PING") {
        conn.send(JSON.stringify({ type: "PONG" }));
      }
    } catch (jsonErr) {
      // Not a JSON message or failed to process
    }
  });

  // Send SyncStep 1
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc);
  send(doc, conn, encoding.toUint8Array(encoder));

  // Send current awareness states
  const awarenessStates = doc.awareness.getStates();
  if (awarenessStates.size > 0) {
    const encoderAw = encoding.createEncoder();
    encoding.writeVarUint(encoderAw, messageAwareness);
    encoding.writeVarUint8Array(
      encoderAw,
      awarenessProtocol.encodeAwarenessUpdate(
        doc.awareness,
        Array.from(awarenessStates.keys())
      )
    );
    send(doc, conn, encoding.toUint8Array(encoderAw));
  }

  conn.on("close", () => {
    closeConn(doc, conn);
  });
}
