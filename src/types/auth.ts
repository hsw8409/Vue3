// types/auth.ts
export interface UserReqProps {
    userId: String;
    passwd: String;
}

export interface UserResProps {
    user: UserProps;
    token: TokenProps;
}

export interface UserProps {
    userId: String;
    chainCd?: String;
    chainNm?: String;
    role?: String;
    userNm: String;
    passwd?: String;
    email?: String;
    loginInOutFg?: String;
    connIp?: String;
    resetTarget?: number | string;
    custCd?: String;
    custNm?: String;
}

export interface TokenProps {
    accessToken: string;
    refreshToken?: string;
}
