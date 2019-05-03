export class WSEmailExistRequest {
    message: 'CHECK_EMAIL';
    requestId: string;
    email: string;
}

export class WSEmailExistResponse {
    message: 'CHECK_EMAIL';
    constructor(public requestId: string, public result: boolean) { }
}

export class WSNicknameExistRequest {
    message: 'CHECK_NICKNAME';
    requestId: string;
    nickname: string;
}

export class WSNicknameExistResponse {
    message: 'CHECK_NICKNAME';
    constructor(public requestId: string, public result: boolean) { }
}
