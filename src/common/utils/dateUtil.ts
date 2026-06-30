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
import dayjs from 'dayjs';

/**
 * 날짜 유틸리티 모듈
 */
export const dateUtil = {
    /**
     * 현재 일자 가져오기
     * @param {string} format 출력 포맷 ('YYYY-MM-DD', 'YYYY.MM.DD', 'YYYYMMDD')
     * @returns {string | Date} 포맷팅된 날짜 문자열 또는 Date 객체
     * @example biz.getToday('YYYY-MM-DD') -> '2026-06-16'
     */
    getToday(format?: string): string | Date {
        if (!format) {
            return new Date();
        }
        return dayjs().format(format);
    },

    /**
     * 기준일자로부터 계산된 날짜 가져오기
     * @param {string} baseDate 'YYYYMMDD' 형식의 기준 날짜 문자열
     * @param {number} calcValue 더하거나 뺄 수치 (양수/음수)
     * @param {'D' | 'M' | 'Y' | string} calcFg 'D'(일), 'M'(월), 'Y'(년) 구별자
     * @param {string} format 출력 포맷 ('YYYY-MM-DD', 'YYYY.MM.DD', 'YYYYMMDD')
     * @returns {string | Date} 계산 및 포맷팅된 날짜 문자열 또는 Date 객체
     * @example biz.getDateCalc('20260616', 10, 'D', 'YYYY-MM-DD')
     */
    getDateCalc(
        baseDate: string,
        calcValue: number,
        calcFg: 'D' | 'M' | 'Y' | string,
        format?: string,
    ): string | Date {
        // 'YYYYMMDD' 문자열을 dayjs 객체로 안전하게 파싱
        const parsedDate = dayjs(baseDate, 'YYYYMMDD');

        if (!parsedDate.isValid()) {
            return format ? '' : new Date();
        }

        // 단위 매핑 (D -> day, M -> month, Y -> year)
        const unitMap: Record<string, dayjs.ManipulateType> = {
            D: 'day',
            M: 'month',
            Y: 'year',
        };
        const unit = unitMap[calcFg.toUpperCase()] || 'day';

        // 날짜 가감 계산
        const calculated = parsedDate.add(calcValue, unit);

        if (!format) {
            return calculated.toDate();
        }
        return calculated.format(format);
    },

    /**
     * 날짜 기간 유효성 체크 (시작일이 종료일보다 같거나 이전인지 확인)
     * @param {string} startDate 'YYYYMMDD' 형식의 시작일
     * @param {string} endDate 'YYYYMMDD' 형식의 종료일
     * @returns {boolean} 유효하면 true, 시작일이 종료일보다 미래면 false
     * @example biz.checkDatePeriod('20260616', '20260626') -> true
     */
    checkDatePeriod(startDate: string, endDate: string): boolean {
        const start = dayjs(startDate, 'YYYYMMDD');
        const end = dayjs(endDate, 'YYYYMMDD');

        if (!start.isValid() || !end.isValid()) {
            return false;
        }

        // 시작일이 종료일과 같거나(isSame) 이전(isBefore)인지 체크
        return start.isBefore(end) || start.isSame(end);
    },
};
