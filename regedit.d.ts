import type { Readable } from 'stream';

export interface REG_SZ_Value {
    value: string;
    type: "REG_SZ";
}

export interface REG_EXPAND_SZ_Value {
    value: string;
    type: "REG_EXPAND_SZ";
}

export interface REG_DWORD_Value {
    value: number;
    type: "REG_DWORD";
}

export interface REG_QWORD_Value {
    value: number;
    type: "REG_QWORD";
}

export interface REG_MULTI_SZ_Value {
    value: string[];
    type: "REG_MULTI_SZ";
}

export interface REG_BINARY_Value {
    value: number[];
    type: "REG_BINARY";
}

export interface REG_DEFAULT_Value {
    value: string;
    type: "REG_DEFAULT";
}

export type RegistryItemValue = REG_SZ_Value | REG_EXPAND_SZ_Value | REG_DWORD_Value | REG_QWORD_Value | REG_MULTI_SZ_Value | REG_BINARY_Value | REG_DEFAULT_Value;

export interface RegistryItem {
    exists: boolean;
    keys: string[];
    values: {
        [name: string]: RegistryItemValue;
        ['']: REG_DEFAULT_Value;
    };
}

export type RegistryStreamItem<T extends readonly string[]> = {
    key: T[number];
    data: RegistryItem;
}

export type RegistryUnexpandedItem<T extends readonly string[]> = {
    key: T[number];
    exists: boolean;
    value: string;
}

export type RegistryItemCollection<T extends readonly string[], U = { [key in T[number]]: RegistryItem }> = U;

export interface RegistryPutItem {
    [name: string]: RegistryItemValue;
    ['']?: REG_DEFAULT_Value;
}

export type RegistryItemPutCollection = {
    [key: string]: RegistryPutItem;
};

type Architecture = "A" | "S" | "32" | "64";
type ErrResCallback<T extends readonly string[]> = (err: Error | undefined, res: RegistryItemCollection<T>) => void;
type ErrResUnexpandedCallback<T extends readonly string[]> = (err: Error | undefined, res: RegistryUnexpandedItem<T>[]) => void;

export interface ReadStream<T> extends Readable {
    read(size?: number): T;
    unpipe<T extends NodeJS.WritableStream>(destination?: T): this;
    unshift(chunk: T): void;
    push(chunk: T | null, encoding?: string): boolean;
    
    addListener(event: 'close', listener: () => void): this;
    addListener(event: 'data', listener: (chunk: T) => void): this;
    addListener(event: 'end', listener: () => void): this;
    addListener(event: 'readable', listener: () => void): this;
    addListener(event: 'error', listener: (err: Error) => void): this;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
  
    emit(event: 'close'): boolean;
    emit(event: 'data', chunk: T): boolean;
    emit(event: 'end'): boolean;
    emit(event: 'readable'): boolean;
    emit(event: 'error', err: Error): boolean;
    emit(event: string | symbol, ...args: any[]): boolean;
  
    on(event: 'close', listener: () => void): this;
    on(event: 'data', listener: (chunk: T) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'readable', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
  
    once(event: 'close', listener: () => void): this;
    once(event: 'data', listener: (chunk: T) => void): this;
    once(event: 'end', listener: () => void): this;
    once(event: 'readable', listener: () => void): this;
    once(event: 'error', listener: (err: Error) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
  
    prependListener(event: 'close', listener: () => void): this;
    prependListener(event: 'data', listener: (chunk: T) => void): this;
    prependListener(event: 'end', listener: () => void): this;
    prependListener(event: 'readable', listener: () => void): this;
    prependListener(event: 'error', listener: (err: Error) => void): this;
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
  
    prependOnceListener(event: 'close', listener: () => void): this;
    prependOnceListener(event: 'data', listener: (chunk: T) => void): this;
    prependOnceListener(event: 'end', listener: () => void): this;
    prependOnceListener(event: 'readable', listener: () => void): this;
    prependOnceListener(event: 'error', listener: (err: Error) => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
  
    removeListener(event: 'close', listener: () => void): this;
    removeListener(event: 'data', listener: (chunk: T) => void): this;
    removeListener(event: 'end', listener: () => void): this;
    removeListener(event: 'readable', listener: () => void): this;
    removeListener(event: 'error', listener: (err: Error) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
  
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}

export function list<K extends string>(keys: readonly K[]): ReadStream<RegistryStreamItem<typeof keys>>;
export function list<K extends string>(keys: readonly K[], architecture: Architecture): ReadStream<RegistryStreamItem<typeof keys>>;
/**
 * @deprecated https://github.com/ironSource/node-regedit#note-about-listing-default-values list with callback api will be deperecated and eventually removed in future versions, take a look at the streaming interface below
 */
export function list<K extends string>(keys: readonly K[], callback: ErrResCallback<typeof keys>): void;
/**
 * @deprecated https://github.com/ironSource/node-regedit#note-about-listing-default-values list with callback api will be deperecated and eventually removed in future versions, take a look at the streaming interface below
 */
export function list<K extends string>(keys: readonly K[], architecture: Architecture, callback: ErrResCallback<typeof keys>): void;

export function listUnexpandedValues<K extends string>(keys: readonly K[]): ReadStream<RegistryUnexpandedItem<typeof keys>>;
export function listUnexpandedValues<K extends string>(keys: readonly K[], architecture: Architecture): ReadStream<RegistryUnexpandedItem<typeof keys>>;
/**
 * @deprecated https://github.com/ironSource/node-regedit#note-about-listing-default-values list with callback api will be deperecated and eventually removed in future versions, take a look at the streaming interface below
 */
export function listUnexpandedValues<K extends string>(keys: readonly K[], callback: ErrResUnexpandedCallback<typeof keys>): void;
/**
 * @deprecated https://github.com/ironSource/node-regedit#note-about-listing-default-values list with callback api will be deperecated and eventually removed in future versions, take a look at the streaming interface below
 */
export function listUnexpandedValues<K extends string>(keys: readonly K[], architecture: Architecture, callback: ErrResUnexpandedCallback<typeof keys>): void;

export type FOLDER_FOUND = 'Folder found and set';
export type FOLDER_NOT_FOUND = 'Folder not found';
export function setExternalVBSLocation(newLocation: string): FOLDER_FOUND | FOLDER_NOT_FOUND;

interface ErrorWithCode extends Error {
    code: number;
    description: string;
}

type ErrCallback = (err: ErrorWithCode | undefined) => void;

export function createKey<K extends string>(keys: readonly K[], callback: ErrCallback): void;
export function createKey<K extends string>(keys: readonly K[], architecture: Architecture, callback?: ErrCallback): void;

export function deleteKey(keys: readonly string[], callback: ErrCallback): void;
export function deleteKey(keys: readonly string[], architecture: Architecture, callback?: ErrCallback): void;

export function putValue(map: RegistryItemPutCollection, callback: ErrCallback): void;
export function putValue(map: RegistryItemPutCollection, architecture: Architecture, callback?: ErrCallback): void;

export namespace arch {
    export function list<K extends string>(keys: readonly K[], callback: ErrResCallback<typeof keys>): void;
    export function list32<K extends string>(keys: readonly K[], callback: ErrResCallback<typeof keys>): void;
    export function list64<K extends string>(keys: readonly K[], callback: ErrResCallback<typeof keys>): void;
    export function listUnexpandedValues<K extends string>(keys: readonly K[], callback: ErrResUnexpandedCallback<typeof keys>): void;
    export function listUnexpandedValues32<K extends string>(keys: readonly K[], callback: ErrResUnexpandedCallback<typeof keys>): void;
    export function listUnexpandedValues64<K extends string>(keys: readonly K[], callback: ErrResUnexpandedCallback<typeof keys>): void;
    export function createKey(keys: readonly string[], callback: ErrCallback): void;
    export function createKey32(keys: readonly string[], callback: ErrCallback): void;
    export function createKey64(keys: readonly string[], callback: ErrCallback): void;
    export function deleteKey(keys: readonly string[], callback: ErrCallback): void;
    export function deleteKey32(keys: readonly string[], callback: ErrCallback): void;
    export function deleteKey64(keys: readonly string[], callback: ErrCallback): void;
    export function putValue(map: RegistryItemPutCollection, callback: ErrCallback): void;
    export function putValue32(map: RegistryItemPutCollection, callback: ErrCallback): void;
    export function putValue64(map: RegistryItemPutCollection, callback: ErrCallback): void;
}

export namespace promisified {
    export function list<K extends string>(keys: readonly K[]): Promise<RegistryItemCollection<typeof keys>>;
    export function list<K extends string>(keys: readonly K[], architecture: Architecture): Promise<RegistryItemCollection<typeof keys>>;
    export function listUnexpandedValues<K extends string>(keys: readonly K[]): Promise<RegistryUnexpandedItem<typeof keys>[]>;
    export function listUnexpandedValues<K extends string>(keys: readonly K[], architecture: Architecture): Promise<RegistryUnexpandedItem<typeof keys>[]>;
    export function createKey(keys: readonly string[]): Promise<void>;
    export function createKey(keys: readonly string[], architecture: Architecture): Promise<void>;
    export function deleteKey(keys: readonly string[]): Promise<void>;
    export function deleteKey(keys: readonly string[], architecture: Architecture): Promise<void>;
    export function putValue(map: RegistryItemPutCollection): Promise<void>;
    export function putValue(map: RegistryItemPutCollection, architecture: Architecture): Promise<void>;

    export namespace arch {
        export function list<K extends string>(keys: readonly K[]): Promise<RegistryItemCollection<typeof keys>>;
        export function list32<K extends string>(keys: readonly K[]): Promise<RegistryItemCollection<typeof keys>>;
        export function list64<K extends string>(keys: readonly K[]): Promise<RegistryItemCollection<typeof keys>>;
        export function listUnexpandedValues<K extends string>(keys: readonly K[]): Promise<RegistryUnexpandedItem<typeof keys>[]>;
        export function listUnexpandedValues32<K extends string>(keys: readonly K[]): Promise<RegistryUnexpandedItem<typeof keys>[]>;
        export function listUnexpandedValues64<K extends string>(keys: readonly K[]): Promise<RegistryUnexpandedItem<typeof keys>[]>;
        export function createKey(keys: readonly string[]): Promise<void>;
        export function createKey32(keys: readonly string[]): Promise<void>;
        export function createKey64(keys: readonly string[]): Promise<void>;
        export function deleteKey(keys: readonly string[]): Promise<void>;
        export function deleteKey32(keys: readonly string[]): Promise<void>;
        export function deleteKey64(keys: readonly string[]): Promise<void>;
        export function putValue(map: RegistryItemPutCollection): Promise<void>;
        export function putValue32(map: RegistryItemPutCollection): Promise<void>;
        export function putValue64(map: RegistryItemPutCollection): Promise<void>;
    }
}
