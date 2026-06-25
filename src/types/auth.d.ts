export interface UserProps {
    userId: string;
    passwd?: string;
    userNm?: string;
    chainCd?: string;
    chainNm?: string;
    role?: string;
    email?: string;
    loginInOutFg?: string;
    connIp?: string;
    resetTarget?: number | string;
    custCd?: string;
    custNm?: string;

    accessToken?: string;
    orgPasswd?: string;
}
