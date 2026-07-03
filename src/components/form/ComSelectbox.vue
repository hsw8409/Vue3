<script setup lang="ts">
/*
 * @file     ComSelectbox.vue
 * @menu     선택박스 공통 컴포넌트
 * @author   astems
 * @since    2026-06-25
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// =====================================================================================================
// Type 선언
// =====================================================================================================
interface SelectOption {
    [key: string]: unknown;
}

interface Props {
    modelValue?: string | null;
    mode?: 'search' | 'input';
    options?: SelectOption[];
    optionsValueKey?: string;
    optionsLabelKey?: string;
    label?: string;
    selectType?: 'A' | 'S' | 'N';
    required?: boolean;
    disabled?: boolean;
}

// =====================================================================================================
// 변수 선언
// =====================================================================================================
// 루트 엘리먼트 자동 속성 상속 방지
defineOptions({
    inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    mode: 'search',
    options: () => [],
    optionsValueKey: 'dtlCommCd',
    optionsLabelKey: 'dtlCommNm',
    label: '',
    selectType: 'A',
    required: false,
    disabled: false,
});

const { t } = useI18n();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'change', event: Event): void;
}>();

const selectRef = ref<HTMLSelectElement | null>(null);

const placeholderMap = {
    A: 'com.label.all',
    S: 'com.label.select',
    N: 'com.label.notSelect',
} as const;

const placeholderKey = computed(() =>
    props.selectType ? placeholderMap[props.selectType] : undefined,
);

const selectedValue = computed({
    get: () => props.modelValue ?? '',
    set: (value) => emit('update:modelValue', String(value)),
});

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
const onChange = (event: Event) => {
    emit('change', event);
};

defineExpose({
    setFocus() {
        selectRef.value?.focus();
    },
});

// =====================================================================================================
// Hook 영역
// =====================================================================================================
watch(
    () => props.options,
    (options?: SelectOption[]) => {
        const list: SelectOption[] = options ?? [];

        if (!props.selectType && !props.modelValue && list.length > 0) {
            const value = list[0]?.[props.optionsValueKey];

            if (value !== undefined && value !== null) {
                emit('update:modelValue', String(value));
            }
        }
    },
    {
        immediate: true,
    },
);
</script>

<template>
    <label v-if="label">{{ required ? '* ' : '' }}{{ label }}</label>

    <div :class="mode === 'search' ? 'search_cell search_cell_long' : 'form_cell form_input'">
        <select
            ref="selectRef"
            v-model="selectedValue"
            :disabled="disabled"
            class="search_input search_select"
            @change="onChange"
        >
            <option v-if="placeholderKey" value="">
                {{ t(placeholderKey) }}
            </option>

            <option
                v-for="item in options"
                :key="String(item[optionsValueKey])"
                :value="String(item[optionsValueKey])"
            >
                {{ item[optionsLabelKey] }}
            </option>
        </select>
    </div>
</template>
<style scoped></style>
