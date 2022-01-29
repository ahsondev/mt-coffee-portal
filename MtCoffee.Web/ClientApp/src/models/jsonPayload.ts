export interface JsonPayload<T> {
    payload?: T;
    errors: string[];
    isSuccess: boolean;
    statusCode: string;
}