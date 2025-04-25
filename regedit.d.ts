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
    type: "REG_SZ";
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
    };
}

export type RegistryItemCollection<T extends readonly string[], U = { [key in T[number]]: RegistryItem }> = U;

export interface RegistryPutItem {
    [name: string]: RegistryItemValue;
}

export type RegistryItemPutCollection = {
    [key: string]: RegistryPutItem;
};

export const OS_ARCH_AGNOSTIC = "A";
export const OS_ARCH_SPECIFIC = "S";
export const OS_ARCH_32BIT = "32";
export const OS_ARCH_64BIT = "64";

type Architecture = (typeof OS_ARCH_AGNOSTIC | typeof OS_ARCH_SPECIFIC | typeof OS_ARCH_32BIT | typeof OS_ARCH_64BIT);
type ErrResCallback<T> = (err: Error | undefined, res: T) => void;

export function list<K extends string>(keys: readonly K[], callback: ErrResCallback<RegistryItemCollection<typeof keys>>): void;
export function list<K extends string>(keys: readonly K[], architecture: Architecture, callback?: ErrResCallback<RegistryItemCollection<typeof keys>>): void;

interface Stream<T> {
    on(event: "data", callback: (entry: T) => void): Stream<T>;
    on(event: "finish", callback: () => void): Stream<T>;
}

interface RegistryEntry<T> {
    key: T;
    data: RegistryItem;
}

export function list<K extends string>(keys: readonly K[]): Stream<RegistryEntry<typeof keys[number]>>;
export function list<K extends string>(keys: readonly K[], architecture: Architecture): Stream<RegistryEntry<typeof keys[number]>>;

export function setExternalVBSLocation(newLocation: string): string;

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

interface UnexpandedValue<T> {
    path: T;
    exists: boolean;
    value: string;
}

export function listUnexpandedValues<K extends string>(key: K, callback: ErrResCallback<UnexpandedValue<typeof key>[]>): void;
export function listUnexpandedValues<K extends string>(key: K): Stream<UnexpandedValue<typeof key>>;
export function listUnexpandedValues<K extends string>(keys: K[], callback: ErrResCallback<UnexpandedValue<typeof keys[number]>[]>): void;
export function listUnexpandedValues<K extends string>(keys: K[]): Stream<UnexpandedValue<typeof keys[number]>>;
export function listUnexpandedValues<K extends string>(key: K, architecture: Architecture, callback: ErrResCallback<UnexpandedValue<typeof key>[]>): void;
export function listUnexpandedValues<K extends string>(key: K, architecture: Architecture): Stream<UnexpandedValue<typeof key>>;
export function listUnexpandedValues<K extends string>(keys: K[], architecture: Architecture, callback: ErrResCallback<UnexpandedValue<typeof keys[number]>[]>): void;
export function listUnexpandedValues<K extends string>(keys: K[], architecture: Architecture): Stream<UnexpandedValue<typeof keys[number]>>;

export namespace arch {
    export function list<K extends string>(keys: readonly K[], callback: ErrResCallback<RegistryItemCollection<typeof keys>>): void;
    export function list32<K extends string>(keys: readonly K[], callback: ErrResCallback<RegistryItemCollection<typeof keys>>): void;
    export function list64<K extends string>(keys: readonly K[], callback: ErrResCallback<RegistryItemCollection<typeof keys>>): void;
    export function list32<K extends string>(keys: readonly K[]): Stream<RegistryEntry<typeof keys[number]>>;
    export function list64<K extends string>(keys: readonly K[]): Stream<RegistryEntry<typeof keys[number]>>;
    export function createKey(keys: readonly string[], callback: ErrCallback): void;
    export function createKey32(keys: readonly string[], callback: ErrCallback): void;
    export function createKey64(keys: readonly string[], callback: ErrCallback): void;
    export function deleteKey(keys: readonly string[], callback: ErrCallback): void;
    export function deleteKey32(keys: readonly string[], callback: ErrCallback): void;
    export function deleteKey64(keys: readonly string[], callback: ErrCallback): void;
    export function putValue(map: RegistryItemPutCollection, callback: ErrCallback): void;
    export function putValue32(map: RegistryItemPutCollection, callback: ErrCallback): void;
    export function putValue64(map: RegistryItemPutCollection, callback: ErrCallback): void;

    export function listUnexpandedValues32<K extends string>(key: K, callback: ErrResCallback<UnexpandedValue<typeof key>[]>): void;
    export function listUnexpandedValues64<K extends string>(key: K, callback: ErrResCallback<UnexpandedValue<typeof key>[]>): void;
    export function listUnexpandedValues32<K extends string>(key: K): Stream<UnexpandedValue<typeof key>>;
    export function listUnexpandedValues64<K extends string>(key: K): Stream<UnexpandedValue<typeof key>>;
    export function listUnexpandedValues32<K extends string>(keys: K[], callback: ErrResCallback<UnexpandedValue<typeof keys[number]>[]>): void;
    export function listUnexpandedValues64<K extends string>(keys: K[], callback: ErrResCallback<UnexpandedValue<typeof keys[number]>[]>): void;
    export function listUnexpandedValues32<K extends string>(keys: K[]): Stream<UnexpandedValue<typeof keys[number]>>;
    export function listUnexpandedValues64<K extends string>(keys: K[]): Stream<UnexpandedValue<typeof keys[number]>>;
}

export namespace promisified {
    export function list<K extends string>(keys: readonly K[]): Promise<RegistryItemCollection<typeof keys>>;
    export function list<K extends string>(keys: readonly K[], architecture: Architecture): Promise<RegistryItemCollection<typeof keys>>;
    export function createKey(keys: readonly string[]): Promise<void>;
    export function createKey(keys: readonly string[], architecture: Architecture): Promise<void>;
    export function deleteKey(keys: readonly string[]): Promise<void>;
    export function deleteKey(keys: readonly string[], architecture: Architecture): Promise<void>;
    export function putValue(map: RegistryItemPutCollection): Promise<void>;
    export function putValue(map: RegistryItemPutCollection, architecture: Architecture): Promise<void>;

    export function listUnexpandedValues<K extends string>(key: K): Promise<UnexpandedValue<typeof key>[]>;
    export function listUnexpandedValues<K extends string>(keys: K[]): Promise<UnexpandedValue<typeof keys[number]>[]>;
    export function listUnexpandedValues<K extends string>(key: K, architecture: Architecture): Promise<UnexpandedValue<typeof key>[]>;
    export function listUnexpandedValues<K extends string>(keys: K[], architecture: Architecture): Promise<UnexpandedValue<typeof keys[number]>[]>;

    export namespace arch {
        export function list<K extends string>(keys: readonly K[]): Promise<RegistryItemCollection<typeof keys>>;
        export function list32<K extends string>(keys: readonly K[]): Promise<RegistryItemCollection<typeof keys>>;
        export function list64<K extends string>(keys: readonly K[]): Promise<RegistryItemCollection<typeof keys>>;
        export function createKey(keys: readonly string[]): Promise<void>;
        export function createKey32(keys: readonly string[]): Promise<void>;
        export function createKey64(keys: readonly string[]): Promise<void>;
        export function deleteKey(keys: readonly string[]): Promise<void>;
        export function deleteKey32(keys: readonly string[]): Promise<void>;
        export function deleteKey64(keys: readonly string[]): Promise<void>;
        export function putValue(map: RegistryItemPutCollection): Promise<void>;
        export function putValue32(map: RegistryItemPutCollection): Promise<void>;
        export function putValue64(map: RegistryItemPutCollection): Promise<void>;

        export function listUnexpandedValues32<K extends string>(key: K): Promise<UnexpandedValue<typeof key>[]>;
        export function listUnexpandedValues64<K extends string>(key: K): Promise<UnexpandedValue<typeof key>[]>;
        export function listUnexpandedValues32<K extends string>(keys: K[]): Promise<UnexpandedValue<typeof keys>[]>;
        export function listUnexpandedValues64<K extends string>(keys: K[]): Promise<UnexpandedValue<typeof keys>[]>;
    }
}
