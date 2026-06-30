<script setup lang="ts">
/*
 * @file     ComSelectbox.vue
 * @menu     선택박스 공통 컴포넌트
 * @author   astems
 * @since    2026-06-25
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
    modelValue?: string | number;
    mode?: 'search' | 'input';
    options?: Record<string, any>[];
    optionsValueKey?: string;
    optionsLabelKey?: string;
    label?: string;
    selectType?: 'A' | 'S' | 'N';
    required?: boolean;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    mode: 'search',
    options: () => [],
    optionsValueKey: 'dtlCommCd',
    optionsLabelKey: 'dtlCommNm',
    label: '',
    selectType: undefined,
    required: false,
    disabled: false,
});
const { t } = useI18n();
const emit = defineEmits(['update:modelValue', 'change']);
const selectRef = ref<HTMLSelectElement | null>(null);

const placeholderMap: Record<'A' | 'S' | 'N', string> = {
    A: 'com.label.all',
    S: 'com.label.select',
    N: 'com.label.notSelect',
};
const config = computed(() => {
    const type = props.selectType;

    return {
        label: props.label ?? '',
        required: props.required ?? false,
        // 2. 타입 검사 통과를 위한 안전한 접근
        // type이 'A' | 'S' | 'N' 중 하나일 때만 매핑 객체에서 값을 가져옴
        placeholderKey:
            type && type in placeholderMap ? placeholderMap[type as 'A' | 'S' | 'N'] : undefined,
    };
});

const selectedValue = computed({
    get: () => props.modelValue ?? '',
    set: (val) => emit('update:modelValue', val),
});

const onChange = (event: Event) => emit('change', event);
const setFocus = () => selectRef.value?.focus();

defineExpose({ setFocus });

watch(
    () => props.options,
    (newOptions) => {
        const type = props.selectType;
        const isAutoSelect = !type || !['A', 'S', 'N'].includes(type);

        // 1. newOptions 자체가 존재하고, 첫 번째 요소가 있는지 확인
        const firstOption = newOptions?.[0];

        // 2. props.modelValue가 비어있고, 자동 선택 조건일 때
        if (isAutoSelect && !props.modelValue && firstOption) {
            // 3. 해당 키 값이 존재하는지 확인 후 안전하게 emit
            const val = firstOption[props.optionsValueKey];
            if (val !== undefined && val !== null) {
                emit('update:modelValue', val);
            }
        }
    },
    { immediate: true },
);
</script>

<template>
    <div v-if="mode === 'search'" class="combo-select-root">
        <label v-if="label">{{ required ? '* ' : '' }}{{ label }}</label>

        <!-- 일반 select -->
        <div class="search_cell search_cell_long">
            <select
                v-model="selectedValue"
                class="search_input search_select"
                :disabled="disabled"
                @change="onChange"
            >
                <option v-if="config.placeholderKey" value="">
                    {{ t(config.placeholderKey) }}
                </option>

                <option
                    v-for="item in options"
                    :key="item[optionsValueKey]"
                    :value="item[optionsValueKey]"
                >
                    {{ item[optionsLabelKey] }}
                </option>
            </select>
        </div>
    </div>
    <div v-else class="form_cell form_input">
        <select v-model="selectedValue" class="select" v-bind="$attrs" @change="onChange">
            <option v-if="selectType === 'A'" value="">{{ t('com.label.all') }}</option>

            <option v-else-if="selectType === 'S'" value="">
                {{ t('com.label.select') }}
            </option>

            <option v-else-if="selectType === 'N'" value="">
                {{ t('com.label.notSelect') }}
            </option>

            <option
                v-for="item in options"
                :key="item[optionsValueKey]"
                :value="item[optionsValueKey]"
            >
                {{ item[optionsLabelKey] }}
            </option>
        </select>
    </div>
</template>
<style scoped></style>
