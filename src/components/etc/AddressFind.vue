<script setup lang="ts">
/**
 * @file      AddressFind.vue
 * @menu      주소찾기
 * @author    astems
 * @since     2026-06-23
 * @version   1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import { biz } from '@/common/utils/biz';

import ComInputbox from '@/components/form/ComInputbox.vue';

// ==================================================
// Type 선언 영역
// ==================================================
declare global {
    interface Window {
        daum: {
            Postcode: new (options: { oncomplete: (data: any) => void }) => {
                open(options: {
                    popupName: string;
                    left: number;
                    top: number;
                    width: number;
                    height: number;
                }): void;
            };
        };
    }
}

interface AddressModel {
    zipno: string;
    roadAddr: string;
    roadDtlAddr: string;
}

interface Props {
    modelValue: AddressModel;
}

// ==================================================
// 변수 선언 영역
// ==================================================
const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: AddressModel): void;
    (e: 'enter'): void;
}>();

const { t } = useI18n();
const textRef = ref<HTMLInputElement | null>(null);

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
/**
 * 주소 변경시 업데이트
 *
 */
const updateAddress = (value: Partial<AddressModel>) => {
    emit('update:modelValue', {
        ...props.modelValue,
        ...value,
    });
};

/**
 * 주소 초기화
 *
 */
const clearAddress = () => {
    updateAddress({
        zipno: '',
        roadAddr: '',
        roadDtlAddr: '',
    });
};

/**
 * 카카오 주소 API Script 로드

 *
 */
const loadDaumScript = () => {
    return new Promise<void>((resolve, reject) => {
        const scriptSrc = biz.API_URL.KAKAO_ADDRES;

        if (window.daum?.Postcode) {
            resolve();
            return;
        }

        const existScript = document.querySelector<HTMLScriptElement>(`script[src="${scriptSrc}"]`);

        if (existScript) {
            existScript.addEventListener('load', () => resolve(), { once: true });
            existScript.addEventListener('error', () => reject(), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = scriptSrc;

        script.onload = () => resolve();
        script.onerror = () => reject();

        document.body.appendChild(script);
    });
};

/**
 * 다음 주소 팝업 호출
 */
const execDaumPostcode = () => {
    clearAddress();

    if (!window.daum?.Postcode) {
        console.error('카카오 주소 API가 로드되지 않았습니다.');
        return;
    }

    const width = 500;
    const height = 600;

    const left = window.screenLeft + window.innerWidth / 2 - width / 2;
    const top = window.screenTop + window.innerHeight / 2 - height / 2;

    new window.daum.Postcode({
        oncomplete: (data: any) => {
            let extraRoadAddr = '';

            if (data.bname && /[동로가]$/.test(data.bname)) {
                extraRoadAddr += data.bname;
            }

            if (data.buildingName && data.apartment === 'Y') {
                extraRoadAddr +=
                    extraRoadAddr !== '' ? `, ${data.buildingName}` : data.buildingName;
            }

            if (extraRoadAddr) {
                extraRoadAddr = ` (${extraRoadAddr})`;
            }

            updateAddress({
                zipno: data.zonecode,
                roadAddr: `${data.roadAddress}${extraRoadAddr}`,
                roadDtlAddr: '',
            });
        },
    }).open({
        popupName: 'postcodePopup',
        left,
        top,
        width,
        height,
    });
};

defineExpose({ setFocus: () => textRef.value?.focus() });

// ==================================================
// Hook 영역
// ==================================================
onMounted(async () => {
    try {
        await loadDaumScript();
    } catch (e) {
        console.error('카카오 주소 API 로드 실패', e);
    }
});
</script>

<template>
    <div class="address">
        <div class="flex smallPopup">
            <div class="form_wrap">
                <span class="form_cell form_input">
                    <ComInputbox
                        ref="textRef"
                        :model-value="modelValue.zipno"
                        class="zip_code"
                        type="text"
                        :placeholder="t('com.label.postalNo')"
                        readonly
                    />
                </span>
            </div>

            <button type="button" class="subBtn" @click="execDaumPostcode">
                <span>{{ t('customer.label.postalNoFind') }}</span>
            </button>
        </div>

        <div class="addressDtl">
            <div class="form_wrap">
                <span class="form_cell form_input">
                    <ComInputbox
                        :model-value="modelValue.roadAddr"
                        class="road_name"
                        type="text"
                        :placeholder="t('customer.label.roadNameAddress')"
                        readonly
                    />
                </span>
            </div>

            <div class="form_wrap">
                <span class="form_cell form_input ml10">
                    <ComInputbox
                        :model-value="modelValue.roadDtlAddr"
                        class="detailAdress"
                        type="text"
                        :placeholder="t('customer.label.detailAddress')"
                        @update:model-value="
                            updateAddress({
                                roadDtlAddr: $event,
                            })
                        "
                    />
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.flex.smallPopup {
    width: 40% !important;
}

.zip_code,
.road_name {
    width: 100% !important;
}
</style>
