import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { WS_URL } from "../../services/api";
import { getStarterCodeForFile, getMonacoLanguage } from "../../constants/starterCode";

interface CodeEditorProps {
  roomId?: string;
  token?: string | null;
  userName?: string;
  fileName?: string;
  language: string;
  value?: string;
  onChange: (value: string) => void;
  onMountEditor?: (editor: any) => void;
}

const CodeEditor = ({
  roomId,
  token,
  userName = "Developer",
  fileName = "script.js",
  language,
  value,
  onChange,
  onMountEditor,
}: CodeEditorProps) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const docRef = useRef<Y.Doc | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const isSyncedRef = useRef<boolean>(false);

  // Helper to rebind Monaco to the currently selected file's Yjs text
  const bindFileToEditor = (targetFileName: string, targetLanguage: string) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const ydoc = docRef.current;
    const provider = providerRef.current;

    if (!editor || !monaco) return;

    // 1. Destroy previous binding if any
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    const model = editor.getModel();
    if (!model) return;

    // 2. Set Monaco editor language model
    const monacoLang = getMonacoLanguage(targetLanguage);
    monaco.editor.setModelLanguage(model, monacoLang);

    // 3. If in collaborative mode with Yjs
    if (ydoc && provider) {
      const yTextName = `file:${targetFileName}`;
      const yText = ydoc.getText(yTextName);

      const binding = new MonacoBinding(
        yText,
        model,
        new Set([editor]),
        provider.awareness
      );
      bindingRef.current = binding;

      const starterCode = getStarterCodeForFile(targetFileName, targetLanguage);

      const checkAndSeedStarterCode = () => {
        if (yText.toString().trim().length === 0) {
          yText.insert(0, starterCode);
        }
        onChange(yText.toString());
      };

      if (isSyncedRef.current) {
        checkAndSeedStarterCode();
      } else {
        // If not yet synced, wait for sync event or brief fallback
        const syncHandler = (synced: boolean) => {
          if (synced) {
            isSyncedRef.current = true;
            checkAndSeedStarterCode();
          }
        };
        provider.once("sync", syncHandler);
        setTimeout(() => {
          if (yText.toString().trim().length === 0) {
            checkAndSeedStarterCode();
          }
        }, 500);
      }

      yText.observe(() => {
        onChange(yText.toString());
      });
    } else {
      // Offline / standalone mode
      const defaultContent = value || getStarterCodeForFile(targetFileName, targetLanguage);
      editor.setValue(defaultContent);
      onChange(defaultContent);
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    if (onMountEditor) {
      onMountEditor(editor);
    }

    editor.onDidChangeModelContent(() => {
      const currentVal = editor.getValue();
      onChange(currentVal);
    });

    if (!roomId || !token) {
      const defaultContent = value || getStarterCodeForFile(fileName, language);
      editor.setValue(defaultContent);
      onChange(defaultContent);
      return;
    }

    try {
      // Initialize shared Yjs Doc for the room
      const ydoc = new Y.Doc();
      docRef.current = ydoc;

      const provider = new WebsocketProvider(WS_URL, roomId, ydoc, {
        params: { token, roomId },
      });
      providerRef.current = provider;

      const colors = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      provider.awareness.setLocalStateField("user", {
        name: userName,
        color: randomColor,
      });

      provider.on("sync", (synced: boolean) => {
        if (synced) {
          isSyncedRef.current = true;
        }
      });

      // Bind the initial file
      bindFileToEditor(fileName, language);
    } catch (err) {
      console.error("[CodeEditor] Collaboration initialization error:", err);
    }
  };

  // Rebind whenever selected file or language changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      bindFileToEditor(fileName, language);
    }
  }, [fileName, language]);

  // Clean up on unmount or room change
  useEffect(() => {
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
      if (docRef.current) {
        docRef.current.destroy();
        docRef.current = null;
      }
      isSyncedRef.current = false;
    };
  }, [roomId]);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        width="100%"
        language={getMonacoLanguage(language)}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          roundedSelection: false,
          cursorBlinking: "smooth",
          smoothScrolling: true,
          wordWrap: "on",
          tabSize: 2,
          suggestOnTriggerCharacters: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;