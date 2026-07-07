/**
 * @file     validator.ts
 * @menu     유효성 검증 util
 * @author   astems
 * @since    2026-06-30
 * @version  1.0
 *
 * @description

 */
// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import {
    required,
    maxLength,
    helpers,
    minLength,
    alphaNum,
    decimal,
    maxValue,
    minValue,
} from '@vuelidate/validators';
import { usePopupStore } from '@/common/stores/popup';

// =====================================================================================================
// Type 선언
// =====================================================================================================
export interface ValidateProps {
    name: string;
    value: string;
    required: boolean;
}

/**
 * 업무 공통 데이터 검증 및 그리드 유틸리티 모듈
 */
export const validator = {
    /**
     * 변경된 그리드 데이터(신규, 수정, 삭제) 분류하여 리턴
     */
    getGridSaveData(grid: any) {
        return {
            insert: grid?.getAddedRowItems() || [],
            update: grid?.getEditedRowItems() || [],
            delete: grid?.getRemovedItems() || [],
        };
    },

    /**
     * 배열로 받은 그리드들의 변경 사항(추가/수정/삭제)이 하나라도 존재하는지 여부 반환
     */
    checkGridChanges(grids: any[]): boolean {
        return grids.some((grid) => {
            if (!grid) return false;
            const addedCnt = grid.getAddedRowItems()?.length || 0;
            const editedCnt = grid.getEditedRowItems()?.length || 0;
            const removedCnt = grid.getRemovedItems()?.length || 0;
            return addedCnt + editedCnt + removedCnt > 0;
        });
    },

    /**
     * 그리드에 전체 체크된 행이 존재하는지 여부 반환
     */
    isThereCheckedRowItemsAll(grid: any): boolean {
        return (grid?.getCheckedRowItemsAll()?.length || 0) !== 0;
    },

    /**
     * 단일 데이터 리스트에 대한 유효성 검증 및 즉시 알럿 출력
     * @param
     */
    async validateBeforeSubmit(checkItems: any[], t: any): Promise<boolean> {
        const regexTel = helpers.regex(/^[0-9]{2,3}-?([0-9]{3,4})-?([0-9]{4})$/);
        const regexHp = helpers.regex(/^[0-9]{3,4}-?([0-9]{3,4})-?([0-9]{4})$/);

        for (const item of checkItems) {
            const valRef = ref(item.value);

            // 한글 조사(을/를, 이/가) 동적 처리를 위한 받침 체크
            const lastChar = item.name?.[item.name.length - 1] || '';
            const code = lastChar.charCodeAt(0);
            const finalConsonantYn = !isNaN(code) && (code - 0xac00) % 28 !== 0;

            // 다국어 메시지 맵핑 구체화
            const requirdMessage = t(`com.message.inputItem${finalConsonantYn ? 'E' : 'L'}`, [
                item.name,
            ]);
            const maxLengthMessage = t(
                `com.message.inputMaxLength${finalConsonantYn ? 'E' : 'L'}`,
                [item.name, item.maxLength],
            );
            const minLengthMessage = t(
                `com.message.inputMinLength${finalConsonantYn ? 'E' : 'L'}`,
                [item.name, item.minLength],
            );
            const regexMessage = t(`com.message.confirmItem${finalConsonantYn ? 'E' : 'L'}`, [
                item.name,
            ]);
            const maxValueMessage = t(`com.message.inputMaxLength${finalConsonantYn ? 'E' : 'L'}`, [
                item.name,
                item.maxValue,
            ]);
            const minValueMessage = t(`com.message.inputMinLength${finalConsonantYn ? 'E' : 'L'}`, [
                item.name,
                item.minValue,
            ]);
            const decimalMessage = t(
                `com.message.numberInputAllowed${finalConsonantYn ? 'E' : 'L'}`,
                [item.name],
            );

            const validations = {
                valRef: {
                    ...(item.required && {
                        required: helpers.withMessage(requirdMessage, required),
                    }),
                    ...(item.maxLength && {
                        maxLength: helpers.withMessage(maxLengthMessage, maxLength(item.maxLength)),
                    }),
                    ...(item.minLength && {
                        minLength: helpers.withMessage(minLengthMessage, minLength(item.minLength)),
                    }),
                    ...(item.alphaNum && {
                        alphaNum: helpers.withMessage(
                            t('user.message.onlyAlphaNumMessage', [item.name]),
                            alphaNum,
                        ),
                    }),
                    ...(item.regexHp && { regexHp: helpers.withMessage(regexMessage, regexHp) }),
                    ...(item.regexTel && { regexTel: helpers.withMessage(regexMessage, regexTel) }),
                    ...(item.maxValue && {
                        maxValue: helpers.withMessage(maxValueMessage, maxValue(item.maxValue)),
                    }),
                    ...(item.minValue && {
                        minValue: helpers.withMessage(minValueMessage, minValue(item.minValue)),
                    }),
                    ...(item.decimal && { decimal: helpers.withMessage(decimalMessage, decimal) }),
                },
            };

            const v$ = useVuelidate(validations, { valRef });
            await v$.value.$validate();

            const errorMsg = v$.value?.$errors?.[0]?.$message as string;

            if (errorMsg) {
                const popupStore = usePopupStore();

                popupStore.alert(errorMsg); // 🌟 주입받은 통로로 안전하게 얼럿 표출
                return false;
            }
        }
        return true;
    },

    /**
     * 그리드의 추가/수정된 모든 행에 대해 유효성 검증 통합 처리
     */
    async validateGridData(grid: any, chk: any[], t: any): Promise<boolean> {
        if (!this.checkGridChanges([grid])) return true;

        const gridData = this.getGridSaveData(grid);
        const targetRows = [...gridData.update, ...gridData.insert];

        for (const rowData of targetRows) {
            const formattedCheckItems = chk.map((item: any) => ({
                ...item,
                value: rowData[item.value],
            }));

            const isValid = await this.validateBeforeSubmit(formattedCheckItems, t);
            if (!isValid) return false;
        }

        return true;
    },

    /**
     * 데이터 빈 값 (null / undefined / 공백) 여부 체크
     */
    checkIsNull(value: any): boolean {
        return (
            value === '' ||
            value === undefined ||
            value === null ||
            String(value).trim().length === 0
        );
    },

    /**
     * 그리드 내 신규 추가된 행의 존재 여부 반환
     */
    checkAddedRowItems(grid: any): boolean {
        return (grid?.getAddedRowItems()?.length || 0) > 0;
    },

    /**
     * 그리드 내 편집/수정된 행의 존재 여부 반환
     */
    checkEditedRowItems(grid: any): boolean {
        return (grid?.getEditedRowItems()?.length || 0) > 0;
    },

    /**
     * 그리드 내 삭제 대상 행의 존재 여부 반환
     */
    checkRemovedItems(grid: any): boolean {
        return (grid?.getRemovedItems()?.length || 0) > 0;
    },

    /**
     * 상품 리스트 선택 유입 시 그리드 적재 데이터와 고유 키(itemCd) 기반 중복 검사 처리
     */
    getGridDataDuplicate(grid: any, addItems: any[] = [], t: any) {
        const gridList = grid?.getGridData() || [];

        if (gridList.length === 0) {
            return {
                addGridData: addItems,
                addMessage: t('price.message.dupException', [0, addItems.length]),
            };
        }

        const gridItemsSet = new Set(gridList.map((data: any) => data.itemCd));
        let dupItemsCnt = 0;

        const newAddList = addItems.filter((item: any) => {
            if (gridItemsSet.has(item.itemCd)) {
                dupItemsCnt++;
                return false;
            }
            return true;
        });

        return {
            addGridData: newAddList,
            addMessage: t('price.message.dupException', [dupItemsCnt, newAddList.length]),
        };
    },
};
