/*
 * @file     types/auth.d.ts
 * @menu     권한 타입 관련
 * @author   astems
 * @since    2026-06-26
 * @version  1.0
 */
export interface TokenProps {
    accessToken: string;
    refreshToken?: string;
}

export interface UserProps {
    userId?: string; // 사용자 id
    userNm?: string; // 사용자명
    passwd?: string; // 비밀번호
    orgPasswd?: string; // 이전비밀번호
    chainCd?: string; // 체인코드
    chainNm?: string; // 체인명
    telNo?: string; // 전화번호
    hpNo?: string; // 핸드폰번호
    email?: string; // 이메일
    zipno?: string; // 우편번호
    roadAddr?: string; // 도로명주소
    roadDtlAddr?: string; // 상세주소
    employGbnFg?: string; //
    userTypeCd?: string; // 사용자유형
    userCustCd?: string; // 사용자거래처코드
    menuGrpCd?: string; // 메뉴권한그룹코드
    menuGrpNm?: string; // 메뉴권한그룹명
    deptCd?: string; // 부서코드
    enterDate?: string; // 입사일자
    leaveDate?: string; //퇴사일자
    useYn?: string; // 사용여부
    insId?: string; //생성자
    insDtime?: string; // 생성일시
    updId?: string; //수정자
    updDtime?: string; // 수정일시
    employmentStatus?: string; // 재직상태
    custCd?: string; // 거래처코드
    custNm?: string; // 거래처명
    accessToken?: string; // 토큰
    refreshToken?: string; // 리플레시토큰
    role?: string; // 권한
    loginInOutFg?: string; // 로그아웃 플래그?
    connIp?: string; // 접속ip
    resetTarget?: number | string; // 비밀번호변경여부
    loginChainCd?: string;
    custTypeCd?: string;
}

export interface UserLogProps {
    userId?: string; // 사용자 id
    logdate?: string; // 접속일자
    searchDateStart?: string; // 검색시작일자
    searchDateEnd?: string; // 검색종료일자
    userNm?: string; // 사용자명
    alUserTypeNm?: string; // 그룹명
    alCountLogdate?: string; // 접속일자집계
    userTypeCd?: string; // 유저타입코드
    alLogtime?: string;
    logip?: string;
    cdt?: string;
    upd?: string;
    loginInOutLog?: string;
}

export interface LoginProps {
    loginChainCd?: string;
    loginId?: string;
}
