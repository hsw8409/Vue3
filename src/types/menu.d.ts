export interface MeneProps {
    pMenuCd?: string;
    lMenuCd?: string;
    mMenuCd?: string;
    lMenuNm?: string;
    mMenuNm?: string;
    pMenuNm?: string;
    filePath?: string;
    fileNm?: string;
    lv?: number;
    pCd?: string;
    mCd?: string;
    mNm?: string;
    mPath?: string;
}

export interface LMenuProps {
    lmenuCd?: string;
    lmenuNm?: string;
    useYn?: string;
    dispSortNo?: string;
    sysGbCd?: string;
}

export interface MMenuProps {
    mmenuCd?: string;
    mmenuNm?: string;
    useYn?: string;
    dispSortNo?: string;
    sysGbCd?: string;
    lmenuCd?: string;
}

export interface PMenuProps {
    pmenuCd?: string;
    pmenuNm?: string;
    filePath?: string;
    fileNm?: string;
    useYn?: string;
    dispSortNo?: string;
    sysGbCd?: string;
    lmenuCd?: string;
    mmenuCd?: string;
}

export interface MenuGroupProps {
    chainCd?: string;
    menuGrpCd?: string;
    alPk?: string;
    menuGrpNm?: string;
    saleDealGrpCd?: string;
    saleDealGrpNm?: string;
    useYn?: string;
    alPMenuCnt?: number;
    alUserCnt?: number;
}

export interface MenuGroupUserProps {
    menuGrpNm?: string;
    menuGrpCd?: string; // 메뉴그룹코드
    chainCd?: string; // 본부코드
    dtlCommNm?: string; // 사용자유형명
    userTypeCd?: string; // 사용자유형코드
    deptCd?: string; // 사용자유형코드
    userNm?: string;
    userId?: string;
    insId?: string; // 등록ID
    insDtime?: string; // 등록일시
    updId?: string; // 수정ID
    updDtime?: string; // 수정일시
    leaveDate?: string; //퇴사일자
}
