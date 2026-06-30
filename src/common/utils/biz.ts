/**
 * @file     biz.ts
 * @menu     biz utils
 * @author   astems
 * @since    2026-06-30
 * @version  1.0
 *
 * @description

 */
// ==================================================
// import 영역
// ==================================================

/**
 * biz 유틸리티 모듈
 */
const biz = {
    // 패스워드 랜덤 KEY
    PASSWORD_RANDOM_KEY: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$^&_',

    // 동적그리드 높이 계산을 위한 유형별 계산할 높이 정의
    // 기본으로 제외시켜야할 높이 : 121
    MENU_LAYOUT: {
        COMP_TYPE_HEIGHT: {
            TOP_LOGO: 50, // 상단 로고
            MENU_TAB: 39, // 메뉴 TAB
            MENU_NAV: 58, // 메뉴 네이게이션
            SEARCH: 54, // 조회조건 1줄
            SEARCH2: 82, // 조회조건 2줄
            SUB_TITLE: 30, // SUB 타이틀 1줄
            SUB_TITLE2: 60, // SUB 타이틀 2줄
            SUB_TITLE_MID: 40, // SUB 타이틀 ( 별도 margin이 들어간 경우 )
            GRID: 283, // 그리드
            ETC: 5, // 여분
        },
        getCommonBase() {
            const comp = this.COMP_TYPE_HEIGHT;
            return comp.TOP_LOGO + comp.MENU_TAB + comp.MENU_NAV + comp.ETC;
        },

        // 기본 아무것도 없이 그리드만 있는 경우
        get BASE() {
            return this.getCommonBase();
        },
        // 조회조건
        get S() {
            const addComp = this.COMP_TYPE_HEIGHT;
            return this.getCommonBase() + addComp.SEARCH - 3; // 그리드만 있는 경우 여백이 포함되어있음
        },
        // 조회조건 2줄
        get S2() {
            const addComp = this.COMP_TYPE_HEIGHT;
            return this.getCommonBase() + addComp.SEARCH2;
        },
        // 서브타이틀만
        get ST() {
            const addComp = this.COMP_TYPE_HEIGHT;
            return this.getCommonBase() + addComp.SUB_TITLE;
        },
        // 조회조건 + 서브타이틀
        get S_ST() {
            const addComp = this.COMP_TYPE_HEIGHT;
            return this.getCommonBase() + addComp.SEARCH + addComp.SUB_TITLE;
        },
        // 조회조건 + 서브타이틀 2줄
        get S_ST2() {
            const addComp = this.COMP_TYPE_HEIGHT;
            return this.getCommonBase() + addComp.SEARCH + addComp.SUB_TITLE2;
        },
        // 조회조건 2줄 + 서브타이틀
        get S2_ST() {
            const addComp = this.COMP_TYPE_HEIGHT;
            return this.getCommonBase() + addComp.SEARCH2 + addComp.SUB_TITLE;
        },
        // 조회조건 2줄 + 그리드
        get S2_G() {
            const addComp = this.COMP_TYPE_HEIGHT;
            return this.getCommonBase() + addComp.SEARCH2 + addComp.GRID;
        },
        // 조회조건 + 서브타이틀 + 그리드 + 서브타이틀
        get S_ST_G_STM() {
            const addComp = this.COMP_TYPE_HEIGHT;
            return (
                this.getCommonBase() +
                addComp.SEARCH +
                addComp.SUB_TITLE +
                addComp.GRID +
                addComp.SUB_TITLE_MID
            );
        },
        // 조회조건2 + 서브타이틀 + 그리드 + 서브타이틀
        get S2_ST_G_STM() {
            const addComp = this.COMP_TYPE_HEIGHT;
            return (
                this.getCommonBase() +
                addComp.SEARCH2 +
                addComp.SUB_TITLE +
                addComp.GRID +
                addComp.SUB_TITLE_MID +
                4
            );
        },
        // 서브타이틀 + 그리드 + 서브타이틀
        get ST_G_STM() {
            const addComp = this.COMP_TYPE_HEIGHT;
            return (
                this.getCommonBase() + addComp.SUB_TITLE + addComp.GRID + addComp.SUB_TITLE_MID + 2
            ); // 여백적용
        },
        // 서브타이틀 + 조회 + 그리드 + 서브타이틀
        get ST_S_G() {
            const addComp = this.COMP_TYPE_HEIGHT;
            return (
                this.getCommonBase() +
                addComp.SUB_TITLE +
                addComp.SEARCH +
                addComp.GRID +
                addComp.SUB_TITLE_MID
            );
        },
    },

    // API URL
    API_URL: {
        KAKAO_ADDRES: '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js', // 카카오톡 주소
    },

    // 팝업 컴포넌트 정의
    POPUP_COMPONENT: {
        CUST_POP: 'UI_CST_P01', // 거래처 팝업
        ITEM_POP: 'UI_ITM_P01', // 상품 팝업
    },

    // 메뉴별 버튼 권한 관리
    MENU_COM_BTN: [
        {
            menuSclsCd: '01001001', // 메뉴분류관리
            btnList: [{ btnNm: '초기화', btnFnc: 'reset' }],
        },
        {
            menuSclsCd: '01001002', // 메뉴그룹 및 권한부여
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '01002001', // 사용자 조회
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '신규', btnFnc: 'newRegi' },
            ],
        },
        {
            menuSclsCd: '01002002', // 사용자 등록 및 수정
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '저장', btnFnc: 'save' },
                { btnNm: '목록', btnFnc: 'pageMove' },
            ],
        },
        {
            menuSclsCd: '01002003', // 사용자 접속 로그
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
            ],
        },
        {
            menuSclsCd: '01003001', // 공토코드관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '02004001', // 거래처 관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '신규', btnFnc: 'newRegi' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '02004002', // 거래처-바코드지역 및 규칙설정
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '02004003', // 내부/외부 바코드 매핑관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '02004004', // 바코드 연결정보
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
            ],
        },
        {
            menuSclsCd: '02004005', // 매출처별 품목중량단가관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '02003001', // 매입단가그룹설정 및 매핑관리
            btnList: [
                { btnNm: '엑셀양식다운', btnFnc: 'excelSampleDown' },
                { btnNm: '엑셀양식업로드', btnFnc: 'excelSampleUpload' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '02003002', // 판매단가그룹설정 및 매핑관리
            btnList: [
                { btnNm: '엑셀양식다운', btnFnc: 'excelSampleDown' },
                { btnNm: '엑셀양식업로드', btnFnc: 'excelSampleUpload' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '02002001', // 매입취급그룹설정 및 품목매핑관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '02002002', // 판매취급그룹설정 및 품목매핑관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '02001001', // 품목분류관리
            btnList: [{ btnNm: '초기화', btnFnc: 'reset' }],
        },
        {
            menuSclsCd: '02001002', // 품목 등록
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '신규', btnFnc: 'newRegi' },
                { btnNm: '저장', btnFnc: 'save' },
                { btnNm: '복사', btnFnc: 'copy' },
            ],
        },
        {
            menuSclsCd: '02001003', // 품목별 라벨속성관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '03001001', // 출고관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
            ],
        },
        {
            menuSclsCd: '03003001', // 주문/매입 일괄등록
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '04001001', // 구매요청등록
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '04001002', // 구매요청확정관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '확정', btnFnc: 'approval' },
            ],
        },
        {
            menuSclsCd: '04001003', // 구매금액변경관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '04001004', // 매입처/품목별 예외단가등록
            btnList: [{ btnNm: '초기화', btnFnc: 'reset' }],
        },
        {
            menuSclsCd: '04001005', // 구매반품등록
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '04001006', // 구매 이력제신고
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '이력제 신고', btnFnc: 'traceReport' },
            ],
        },
        {
            menuSclsCd: '05001001', // 입고관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
            ],
        },
        {
            menuSclsCd: '05001002', // 유통이력관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '05001003', // 입고현황
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '원장인쇄', btnFnc: 'ledgerPrint' },
            ],
        },
        {
            menuSclsCd: '06001001', // 견적1
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
                { btnNm: '인쇄', btnFnc: 'print' },
            ],
        },
        {
            menuSclsCd: '06001002', // 견적2
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '06001010', // 매출처별 매입처 매핑
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '06001011', // 매출처별 견적서관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
                { btnNm: '인쇄', btnFnc: 'print' },
            ],
        },
        {
            menuSclsCd: '06002001', // 재고현황
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '엑셀', btnFnc: 'excelDown' },
                { btnNm: '조회', btnFnc: 'search' },
            ],
        },
        {
            menuSclsCd: '06002002', // 상품해체
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '06002003', // 한돈 재고현황표
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
            ],
        },
        {
            menuSclsCd: '06002004', // 한우 재고현황표
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
            ],
        },
        {
            menuSclsCd: '06002005', // 해체확정관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '확정', btnFnc: 'approval' },
            ],
        },
        {
            menuSclsCd: '06002006', // 바코드 검색
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
            ],
        },
        {
            menuSclsCd: '06003001', // 발주등록
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '06003002', // 발주확정관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '발주확정', btnFnc: 'approval' },
                { btnNm: '수주확정', btnFnc: 'orderConfirm' },
            ],
        },
        {
            menuSclsCd: '06003003', // 발주현황
            btnList: [
                { btnNm: '엑셀다운로드(출고대장)', btnFnc: 'excelDown' },
                { btnNm: '마지막거래일자검색', btnFnc: 'lastTradeDateSearch' },
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '원장인쇄', btnFnc: 'ledgerPrint' },
                { btnNm: '전표인쇄', btnFnc: 'voucherPrint' },
                { btnNm: '이력번호 동기화', btnFnc: 'traceNumSynch' },
            ],
        },
        {
            menuSclsCd: '06003004', // 발주금액변경관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '06003005', // 매출처/품목별 예외단가등록
            btnList: [{ btnNm: '초기화', btnFnc: 'reset' }],
        },
        {
            menuSclsCd: '06003006', // 발주반품등록
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '06003007', // 판매 이력제신고
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '이력제 신고', btnFnc: 'traceReport' },
            ],
        },
        {
            menuSclsCd: '06003008', // 재고기준정보
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '06004001', // 경영목표관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '06005001', // 실사현황
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
            ],
        },
        {
            menuSclsCd: '07001001', // 세금계산서 발행
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '발행 엑셀 다운로드', btnFnc: 'excelDown' },
                { btnNm: '발행금액 취소', btnFnc: 'issueAmtCancel' },
            ],
        },
        {
            menuSclsCd: '07001002', // 월채권 및 입금관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '07001003', // 월채무 및 지급관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '08001001', // 매출분석현황
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
            ],
        },
        {
            menuSclsCd: '08001002', // 매입분석현황
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
            ],
        },
        {
            menuSclsCd: '08001003', // 마감처리
            btnList: [
                { btnNm: '일자전체마감', btnFnc: 'close' },
                { btnNm: '전체마감취소', btnFnc: 'closeCancel' },
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
            ],
        },
        {
            menuSclsCd: '08002001', // 일별/거래처별 집계현황
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
            ],
        },
        {
            menuSclsCd: '10001001', // 생산지시요청
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
                { btnNm: '등록확정', btnFnc: 'regiApproval' },
            ],
        },
        {
            menuSclsCd: '10001002', // 포장 이력제신고
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '이력제 신고', btnFnc: 'traceReport' },
            ],
        },
        {
            menuSclsCd: '10002001', // 생산공정관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '공정진행반려', btnFnc: 'processReject', btnClass: 'default2' },
                { btnNm: '반려및전표삭제', btnFnc: 'delete', btnClass: 'default2' },
            ],
        },
        {
            menuSclsCd: '10002002', // 생산공정처리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '확정', btnFnc: 'approval' },
                { btnNm: '뒤로', btnFnc: 'back' },
            ],
        },
        {
            menuSclsCd: '10002003', // 생산결과
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '인쇄', btnFnc: 'print' },
                { btnNm: '엑셀', btnFnc: 'excel' },
            ],
        },
        {
            menuSclsCd: '10003001', // 장비관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '10003003', // 라벨사이즈관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '신규', btnFnc: 'newRegi' },
                { btnNm: '저장', btnFnc: 'save' },
                { btnNm: '삭제', btnFnc: 'delete' },
            ],
        },
        {
            menuSclsCd: '10003004', // 공정유형-사이즈 매핑
            btnList: [
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '신규', btnFnc: 'newRegi' },
                { btnNm: '복사', btnFnc: 'copy' },
                { btnNm: '저장', btnFnc: 'save' },
                { btnNm: '삭제', btnFnc: 'delete' },
            ],
        },
        {
            menuSclsCd: '10003005', // 라벨필드관리
            btnList: [
                { btnICon: '－', btnNm: '배율축소', btnFnc: 'zoomIn' },
                { btnICon: '＋', btnNm: '배율확대', btnFnc: 'zoomOut' },
                { btnICon: '🔄', btnNm: '배율초기화', btnFnc: 'zoomReset' },
                { btnNm: '필드추가', btnFnc: 'add' },
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
        {
            menuSclsCd: '10003006', // 라벨별 필드 문구 관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
            ],
        },
        {
            menuSclsCd: '13001001', // 체인 관리
            btnList: [
                { btnNm: '초기화', btnFnc: 'reset' },
                { btnNm: '조회', btnFnc: 'search' },
                { btnNm: '신규', btnFnc: 'newRegi' },
                { btnNm: '저장', btnFnc: 'save' },
            ],
        },
    ],
};

export { biz };
