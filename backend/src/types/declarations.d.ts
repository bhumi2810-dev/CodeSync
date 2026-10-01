declare module "y-protocols/dist/sync.cjs" {
  export const messageYjsSyncStep1: number;
  export const messageYjsSyncStep2: number;
  export const messageYjsUpdate: number;
  export function readSyncMessage(decoder: any, encoder: any, doc: any, transactionOrigin: any): number;
  export function readSyncStep1(decoder: any, encoder: any, doc: any): void;
  export function readSyncStep2(decoder: any, doc: any, transactionOrigin: any): void;
  export function readUpdate(decoder: any, doc: any, transactionOrigin: any): void;
  export function writeSyncStep1(encoder: any, doc: any): void;
  export function writeSyncStep2(encoder: any, doc: any, encodedStateVector?: Uint8Array): void;
  export function writeUpdate(encoder: any, update: Uint8Array): void;
}

declare module "y-protocols/dist/awareness.cjs" {
  export class Awareness {
    constructor(doc: any);
    doc: any;
    clientID: number;
    states: Map<number, any>;
    meta: Map<number, any>;
    _checkInterval: any;
    getLocalState(): any;
    setLocalState(state: any): void;
    setLocalStateField(field: string, value: any): void;
    getStates(): Map<number, any>;
    on(event: string, handler: Function): void;
    off(event: string, handler: Function): void;
    destroy(): void;
  }
  export function encodeAwarenessUpdate(awareness: Awareness, clients: number[], states?: Map<number, any>): Uint8Array;
  export function applyAwarenessUpdate(awareness: Awareness, update: Uint8Array, origin: any): void;
  export function removeAwarenessStates(awareness: Awareness, clients: number[], origin: any): void;
}

declare module "lib0/dist/encoding.cjs" {
  export class Encoder {}
  export function createEncoder(): Encoder;
  export function writeVarUint(encoder: Encoder, num: number): void;
  export function writeVarString(encoder: Encoder, str: string): void;
  export function writeVarUint8Array(encoder: Encoder, uint8Array: Uint8Array): void;
  export function toUint8Array(encoder: Encoder): Uint8Array;
  export function length(encoder: Encoder): number;
}

declare module "lib0/dist/decoding.cjs" {
  export class Decoder {}
  export function createDecoder(uint8Array: Uint8Array): Decoder;
  export function readVarUint(decoder: Decoder): number;
  export function readVarString(decoder: Decoder): string;
  export function readVarUint8Array(decoder: Decoder): Uint8Array;
  export function hasContent(decoder: Decoder): boolean;
}
