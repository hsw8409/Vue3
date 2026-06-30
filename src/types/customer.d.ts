export interface CustomerProps {
    chainCd?: string; // 체인코드
    custCd?: string; // 거래처코드
    custNm?: string; // 거래처명
    bizerNm?: string; //사업자명
    custTypeCd?: string; //거래처유형코드
    ownerNm?: string; //대표자명
    bizerNo?: string; //사업자번호
    subBizerNo?: string; //서브사업자번호
    taxFreeGbnCd?: string; //과세구분
    bizCondition?: string; //업태
    category?: string; // 업종
    whcenterCd?: string; //물류창고코드
    whcenterNm?: string; //물류창고명
    telNo?: string; //전화번호
    faxNo?: string; //팩스번호
    zipno?: string; //우편번호
    roadAddr?: string; //주소
    roadDtlAddr?: string; //상세주소
    openDate?: string; //오픈일자
    closeDate?: string; //폐점일자
    tranStatCd?: string; // 거래상태
    saleTypeCd?: string; //매출유형코드
    salePrcGrpCd?: string; //판매단가그룹코드
    saleDealGrpCd?: string; //판매취급그룹코드
    subsidyRate?: string; //장려금지원금
    purchPrcGrpCd?: string; //매입단가그룹코드
    purchDealGrpCd?: string; //매입취급그룹코드
    managerId?: string; //담당자
    fiManagerNm?: string; //계약담당자
    fiTelNo?: string; //계약담당연락처
    fiEmail?: string; //계약담당자이메일
    fiBankCd?: string; //공급자은행코드
    fiBankNm?: string; //공급자은행
    fiAcctNo?: string; //공급자계좌번호
    fiAcctNm?: string; //공급자계좌
    fiAccountNm?: string; //공급자 예금주
    fiPaymentTerms?: string;
    useYn?: string; //사용여부
    insId?: string; //생성자
    insDtime?: string; // 생성일시
    updId?: string; //수정자
    updDtime?: string; // 수정일시
    show?: string;
    purchExcpPrcUseYn?: string;
    remark?: string; //비고
    itemCnt?: string; //품목수
    logoImgFileId?: string; // 로고이미지
    orgFileNm?: string; //원본명
    scmUseYn?: string; //협력사포털사용여부
    pmsUseYn?: string; //판매처포털사용여부

    chainUseScmYn?: string; // 체인의 협력사포털사용여부
    chainUsePmsYn?: string; // 체인의 판매처포털사용여부

    userTypeCd?: string; // 사용자 등록시 선택한 사용자 유형
}
