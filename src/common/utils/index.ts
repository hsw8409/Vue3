import { defineAsyncComponent, markRaw } from 'vue';
import type { Component } from 'vue';
import { biz } from '@/common/utils/biz';
import { dateUtil } from '@/common/utils/dateUtil.ts';
import { validator } from '@/common/utils/validator.ts';
import { stringUtil } from '@/common/utils/stringUtil.ts';

/* =====================
    Utils Type
===================== */

export const utils = {
    string: {
        /** 공백 제거 */
        trim: (str: string): string => str?.trim() ?? '',

        /** 소문자 */
        lower: (str: string): string => str?.toLowerCase() ?? '',

        /** 대문자 */
        upper: (str: string): string => str?.toUpperCase() ?? '',

        /** 첫 글자 대문자 */
        capitalize: (str: string): string =>
            str ? str.charAt(0).toUpperCase() + str.slice(1) : '',

        /** kebab-case 변환 */
        kebab: (str: string): string =>
            str
                ?.replace(/([a-z])([A-Z])/g, '$1-$2')
                ?.replace(/\s+/g, '-')
                ?.toLowerCase() ?? '',
    },

    obj: {
        isBlank: (obj: unknown): boolean => {
            return (
                obj === '' ||
                obj === null ||
                obj === undefined ||
                (typeof obj === 'object' &&
                    obj !== null &&
                    !Array.isArray(obj) &&
                    Object.keys(obj).length === 0) ||
                (typeof obj === 'string' && obj.trim().length === 0)
            );
        },

        isEmptyFile: (obj: any): boolean => {
            if (obj?.size) return obj.size <= 0;
            if (obj === '' || obj === null || obj === undefined) return true;

            return !(obj?.[0]?.files?.length > 0);
        },
    },

    component: {
        load: async (path: string): Promise<Component> => {
            const errorComponent = () => {
                return null;
            };

            const component = await defineAsyncComponent({
                loader: () => import(/* @vite-ignore */ `${path}`),
                delay: 200,
                errorComponent,
            });

            return markRaw(component);
        },
    },
    biz,
    dateUtil,
    validator,
    stringUtil,
};
