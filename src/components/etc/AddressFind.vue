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
import { ref } from 'vue';
import { biz } from '@/common/utils/biz';

// ==================================================
// Type 선언 영역
// ==================================================
declare global {
    interface Window {
        daum: any;
    }
}

interface AddressModel {
    zipno: string;
    roadAddr: string;
    roadDtlAddr: string;
    [key: string]: any;
}

interface Props {
    modelValue: AddressModel;
    params?: {
        popupYn?: boolean;
        [key: string]: any;
    };
}

// ==================================================
// 변수 선언 영역
// ==================================================
const props = withDefaults(defineProps<Props>(), {
    params: () => ({ popupYn: false }),
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: AddressModel): void;
    (e: 'enter'): void;
}>();

const { t } = useI18n();
const textRef = ref<HTMLInputElement | null>(null);

// 카카오 주소 API 스크립트 중복 삽입 방지 가드
const scriptSrc = biz.API_URL.KAKAO_ADDRES;
if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
    const script = document.createElement('script');
    script.src = scriptSrc;
    document.body.appendChild(script);
}

// ==================================================
// 사용자 정의 함수 영역
// ==================================================

/**
 * 주소 초기화
 *
 */
const resetAddress = () => {
    // props를 직접 바꾸지 않고, 완전히 비워진 새 객체를 부모에게 전달합니다.
    emit('update:modelValue', {
        ...props.modelValue,
        zipno: '',
        roadAddr: '',
        roadDtlAddr: '',
    });
};

/**
 * 다음 주소 팝업 호출
 *
 */
const execDaumPostcode = () => {
    resetAddress();

    if (!window.daum || !window.daum.Postcode) {
        console.error('카카오 주소 API 스크립트가 아직 로드되지 않았습니다.');
        return;
    }

    const width = 500;
    const height = 600;

    // 💡 현재 띄워져 있는 브라우저 창 기준 가로/세로 중앙 좌표 계산 (듀얼 모니터 완벽 대응)
    const left = window.screenLeft + window.innerWidth / 2 - width / 2;
    const top = window.screenTop + window.innerHeight / 2 - height / 2;

    new window.daum.Postcode({
        oncomplete: (data: any) => {
            let roadAddr = data.roadAddress;
            let extraRoadAddr = '';

            if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                extraRoadAddr += data.bname;
            }
            if (data.buildingName !== '' && data.apartment === 'Y') {
                extraRoadAddr +=
                    extraRoadAddr !== '' ? ', ' + data.buildingName : data.buildingName;
            }
            if (extraRoadAddr !== '') {
                extraRoadAddr = ' (' + extraRoadAddr + ')';
            }

            emit('update:modelValue', {
                ...props.modelValue,
                zipno: data.zonecode,
                roadAddr: roadAddr + extraRoadAddr,
                roadDtlAddr: '',
            });
        },
    }).open({
        popupName: 'postcodePopup',
        left: left,
        top: top,
        width: width,
        height: height,
    });
};

defineExpose({ setFocus: () => textRef.value?.focus() });
</script>

<template>
    <div class="address">
        <div :class="['flex', params.popupYn ? 'smallPopup' : 'small']">
            <div class="form_wrap">
                <span class="form_cell form_input">
                    <ComInput
                        ref="textRef"
                        :model-value="modelValue.zipno"
                        class="zip_code"
                        type="text"
                        :placeholder="t('com.label.postalNo')"
                        readonly
                        @click="resetAddress"
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
                    <ComInput
                        :model-value="modelValue.roadAddr"
                        class="road_name"
                        type="text"
                        :placeholder="t('customer.label.roadNameAddress')"
                    />
                </span>
            </div>
            <div class="form_wrap">
                <span class="form_cell form_input ml10">
                    <ComInput
                        :model-value="modelValue.roadDtlAddr"
                        class="detailAdress"
                        type="text"
                        :placeholder="t('customer.label.detailAddress')"
                        @update:model-value="
                            emit('update:modelValue', { ...modelValue, roadDtlAddr: $event })
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
.flex.small {
    width: 15% !important;
}
.zip_code {
    width: 100% !important;
}
.road_name {
    width: 100% !important;
}
</style>
