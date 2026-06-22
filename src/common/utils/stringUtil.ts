/**
 * 업무 공통 String 유틸리티 모듈
 */
export const stringUtil = {
    /*
        문자열 바이트 계산
        ex) biz.getByteB('안녕하세요')
    */
    getByteB(str: string) {
        let byte = 0;
        for (let i = 0; i < str.length; ++i) {
            byte += str.charCodeAt(i) > 127 ? 2 : 1;
        }
        return byte;
    },
    /*
        포맷스트링 ( 전화번호, 이메일주소 등)
        ex) biz.checkDigitFormat('hpNo','010-1234-1234')
    */
    getDigitFormatString(digitFg: string, digitValue: string) {
        if (typeof digitValue !== 'string') return false;

        const trimmedValue = digitValue.trim()?.replace(/\D/g, '');

        switch (digitFg) {
            case 'bizNo': // 사업자등록번호: 3-2-5 자리
                return trimmedValue.slice(0, 10).replace(/(\d{1,3})(\d{1,2})(\d{1,5})/, '$1-$2-$3');
        }
    },
    labelFunction(commonCode: any, value: string) {
        let columnValue;
        commonCode.forEach(function (code: any) {
            if (code.dtlCommCd == value) {
                columnValue = code.dtlCommNm;
            }
        });
        return columnValue;
    },
    /*
        전화번호 포맷팅
        ex) biz.checkDigitFormat('hpNo','010-1234-1234')
    */
    getFormatTelNo(newVal: string) {
        const digitsOnly = newVal?.replace(/[^\d]/g, '').substr(0, 15);
        if (!digitsOnly) {
            return '';
        }
        const telLen = digitsOnly.length;
        const twoTel = digitsOnly.slice(0, 2);
        if (telLen >= 12) {
            return digitsOnly.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3').slice(0, 14);
        } else if (telLen === 11) {
            return digitsOnly.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        } else if (twoTel == '02' && telLen === 10) {
            return digitsOnly.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
        } else if (twoTel == '02' && telLen === 9) {
            return digitsOnly.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
        } else if (telLen === 10) {
            return digitsOnly.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        } else {
            return digitsOnly.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }
    },
    /*
    마스킹
    ex) biz.getMaskingData('hpNo', '01012345678') → '010****5678'
*/
    getMaskingData(type: string, value: string) {
        if (!value) return '';

        switch (type) {
            case 'telNo': // 전화번호
                return value.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2');

            case 'hpNo': // 휴대폰번호
                return value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');

            case 'name': // 이름
                if (value.length === 2) {
                    return value[0] + '*';
                } else if (value.length > 2) {
                    return value[0] + '*'.repeat(value.length - 2) + value[value.length - 1];
                }
                return value;
        }
    },
};
