export interface ErrorWithCode extends Error {
    code: number;
    description?: string;
}

type Errors = {
    [key: number]: ErrorWithCode;
};

declare const errors: Errors;

export default errors;
