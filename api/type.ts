export enum StatusRes {
    SUCCESS = 'SUCCESS', ERROR = 'ERROR'
}

export interface DataResponse<T> {
    status: StatusRes;
    code: string;
	message: string;
    handleJsDate: boolean;
    data: T;
    errorServer: ErrorServer[];
}

export interface AesToken {
    token: string
    data: string
}

export interface ErrorServer {
    code: string;
    rawMessage: string;
    path: string;
}