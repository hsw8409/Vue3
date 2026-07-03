/*
 * @file     types/menu.d.ts
 * @menu     메뉴 타입 관련
 * @author   astems
 * @since    2026-06-26
 * @version  1.0
 */

export interface MenuProps {
    pMenuCd?: string;
    lMenuCd?: string;
    mMenuCd?: string;
    lMenuNm?: string;
    mMenuNm?: string;
    pMenuNm?: string;
    filePath?: string;

    fileNm?: string; // 파일명
    lv?: number;
    mpath?: string; // 파일 경로
    mnm?: string;
    mcd?: string;
    pcd?: string; // 상위코드
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

export interface MenuItemProps {
    mcd: string;
    mnm: string;
    pcd?: string | null; // 상위코드
    lv: number | string;
    mpath?: string; // 파일 경로
    fileNm?: string; // 파일명
    useYn?: string;
    visiable?: boolean;
    show?: boolean;
    children?: MenuItemProps[];
}

export interface SelectedMenuProps {
    lname: string;
    mname: string;
    sname: string;
    path?: string;
    mcd: string;
    fileNm?: string;
}

export interface MenuGroupResProps {
    userDtos?: MenuGroupUserProps[];
    programDtos?: MenuGroupPropgramProps[];
}

export interface MenuGroupPropgramProps {
    lMenuCd?: string; // 대분류메뉴코드
    lMenuNm?: string; // 대분류메뉴명칭
    mMenuCd?: string; // 중분류메뉴코드
    mMenuNm?: string; // 중분류메뉴명칭
    pMenuCd?: string; // 프로그램메뉴코드
    pMenuNm?: string; // 프로그램메뉴명칭
    chainCd?: string; // 본부코드
    menuGrpCd?: string; // 메뉴그룹코드
    useYn?: string; // 사용여부
    insId?: string; // 등록ID
    insDtime?: string; // 등록일시
    updId?: string; // 수정ID
    updDtime?: string; // 시스템구분코드
    sysGbCd?: string; //퇴사일자
}
