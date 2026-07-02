<script setup lang="ts">
/*
 * @file     ItemCategory.vue
 * @menu     품목분류 검색 공통 컴포넌트
 * @author   astems
 * @since    2026-06-29
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { onMounted, ref, computed, watch } from 'vue';
import TokenService from '@/common/service/token';
import { useI18n } from 'vue-i18n';

import { selectCategories } from '@/api/item';
import { CategoryGroupsProps } from '@/types/item';

// ==================================================
// Type 선언 영역
// ==================================================

interface ItemCategory {
    lclsItemCd?: string;
    mclsItemCd?: string;
    sclsItemCd?: string;
}

// ==================================================
// 변수 선언 영역
// ==================================================
// 루트 엘리먼트 자동 속성 상속 방지
defineOptions({ inheritAttrs: false });

const props = defineProps<{
    modelValue: ItemCategory;
}>();

// 공통 메세지 변수
const { t } = useI18n();

const emit = defineEmits<{
    (e: 'update:modelValue', value: ItemCategory): void;
}>();

const categories = ref<CategoryGroupsProps>({
    lclsCategory: [],
    mclsCategory: [],
    sclsCategory: [],
});

const form = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
});

// =================================================================
// 사용자 정의 함수 영역
// =================================================================

const filteredMcls = computed(() =>
    categories.value.mclsCategory.filter((item) => item.parentCd === form.value.lclsItemCd),
);

const filteredScls = computed(() =>
    categories.value.sclsCategory.filter((item) => item.parentCd === form.value.mclsItemCd),
);

const selectCategory = async () => {
    try {
        const res = await selectCategories({
            chainCd: TokenService.getUser().chainCd,
        });

        if (res?.data?.result) {
            categories.value = res.data.result;
        }
    } catch (error) {
        console.error(error);
    }
};

// ==================================================
// Hook 영역
// ==================================================

watch(
    () => form.value.lclsItemCd,
    () => {
        emit('update:modelValue', {
            ...form.value,
            mclsItemCd: '',
            sclsItemCd: '',
        });
    },
);

watch(
    () => form.value.mclsItemCd,
    () => {
        emit('update:modelValue', {
            ...form.value,
            sclsItemCd: '',
        });
    },
);

onMounted(selectCategory);
</script>

<template>
    <li>
        <div class="search_container">
            <label>{{ t('item.label.lcls') }}</label>

            <div class="search_cell search_cell_long">
                <select v-model="form.lclsItemCd" class="search_input search_select">
                    <option value="">전체</option>

                    <option
                        v-for="item in categories.lclsCategory"
                        :key="item.categoryCd"
                        :value="item.categoryCd"
                    >
                        {{ item.categoryNm }}
                    </option>
                </select>
            </div>
        </div>
    </li>

    <li>
        <div class="search_container">
            <label>{{ t('item.label.mcls') }}</label>

            <div class="search_cell search_cell_long">
                <select v-model="form.mclsItemCd" class="search_input search_select">
                    <option value="">전체</option>

                    <option
                        v-for="item in filteredMcls"
                        :key="item.categoryCd"
                        :value="item.categoryCd"
                    >
                        {{ item.categoryNm }}
                    </option>
                </select>
            </div>
        </div>
    </li>

    <li>
        <div class="search_container">
            <label>{{ t('item.label.scls') }}</label>

            <div class="search_cell search_cell_long">
                <select v-model="form.sclsItemCd" class="search_input search_select">
                    <option value="">전체</option>

                    <option
                        v-for="item in filteredScls"
                        :key="item.categoryCd"
                        :value="item.categoryCd"
                    >
                        {{ item.categoryNm }}
                    </option>
                </select>
            </div>
        </div>
    </li>
</template>
