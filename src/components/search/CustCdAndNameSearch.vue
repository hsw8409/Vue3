<script setup lang="ts">
/*
 * @file     CustCdAndNameSearch.vue
 * @menu     거래처코드/명 검색 공통 컴포넌트
 * @author   astems
 * @since    2026-06-26
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, computed } from 'vue';
import { utils } from '@/common/utils';
import { usePopupStore } from '@/common/stores/popup';

// ==================================================
// 변수 선언 영역
// ==================================================
// 루트 엘리먼트 자동 속성 상속 방지
defineOptions({ inheritAttrs: false });

interface Props {
    modelValue?: Record<string, any>;
    label?: string;
    codeKey?: string;
    nameKey?: string;
    params?: Record<string, any>;
    required?: boolean;
    disabled?: boolean;
    popupPg?: string;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => ({}),
    label: '',
    codeKey: 'custCd',
    nameKey: 'custNm',
    params: () => ({}),
    required: false,
    disabled: false,
    popupPg: '',
});

const popup = usePopupStore();
const inputRef = ref<HTMLInputElement | null>(null);
const emit = defineEmits(['update:modelValue', 'enter']);

const popupPage = computed(() => {
    return props.popupPg || utils.biz.POPUP_COMPONENT?.CUST_POP || '';
});

// ==================================================
// import 영역
// ==================================================

const inParam = computed(() => props.modelValue ?? {});

const popupSelect = (selected: any) => {
    if (!selected) return;

    const newVal = {
        ...(props.modelValue ?? {}),
        [props.codeKey]: selected[props.codeKey] ?? '',
        [props.nameKey]: selected[props.nameKey] ?? '',
    };

    emit('update:modelValue', newVal);
};
const popupHandler = async () => {
    const { popupPromise } = popup.openPopup('biz', popupPage.value, {
        param: {
            ...props.modelValue,
            ...props.params,
        },
    });

    const selected = await popupPromise;

    popupSelect(selected);
};

const inputCodeChange = (e: Event) => {
    const target = e.target as HTMLInputElement;

    emit('update:modelValue', {
        ...(props.modelValue ?? {}),
        [props.codeKey]: target.value.trim(),
        [props.nameKey]: '',
    });
};

function setFocus() {
    inputRef.value?.focus();
}

defineExpose({ setFocus });

// ==================================================
// Hook 영역
// ==================================================
</script>
<template>
    <label v-if="label">{{ required ? '* ' : '' }}{{ label }}</label>
    <div class="popupOpen_wrap form_cell form_input">
        <span class="popupOpen_code">
            <input
                ref="inputRef"
                type="text"
                class="search_input"
                placeholder="Search"
                maxlength="15"
                :value="inParam?.[codeKey] ?? ''"
                :disabled="disabled"
                @input="inputCodeChange"
                @focus="() => inputRef?.select()"
                @keydown.enter="popupHandler()"
            />
            <button class="btn_input input_search" @click="popupHandler()"></button>
        </span>
        <div class="popupOpen_name">
            <input
                type="text"
                class="search_input"
                :value="inParam[nameKey]"
                :disabled="disabled"
                readonly
            />
        </div>
    </div>
</template>
