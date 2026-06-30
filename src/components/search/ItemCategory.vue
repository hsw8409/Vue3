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

interface CategoryItem {
    categoryCd: string;
    categoryNm: string;
    parentCd: string;
}

interface Categories {
    lclsCategory: CategoryItem[];
    mclsCategory: CategoryItem[];
    sclsCategory: CategoryItem[];
}

const categories = ref<Categories>({
    lclsCategory: [],
    mclsCategory: [],
    sclsCategory: [],
});

// 공통 메세지 변수
const { t } = useI18n();

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const form = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
});

// 수정: 인터페이스의 이름인 lclsCategory, mclsCategory 등을 사용해야 함
const filteredMcls = computed(() =>
    categories.value.mclsCategory.filter((i) => i.parentCd === form.value.lclsItemCd),
);
const filteredScls = computed(() =>
    categories.value.sclsCategory.filter((i) => i.parentCd === form.value.mclsItemCd),
);

// (watch 로직은 이전과 동일)
watch(
    () => form.value.lclsItemCd,
    () => {
        form.value.mclsItemCd = '';
        form.value.sclsItemCd = '';
    },
);
watch(
    () => form.value.mclsItemCd,
    () => {
        form.value.sclsItemCd = '';
    },
);

const selectCategory = async () => {
    try {
        const res = await selectCategories({ chainCd: TokenService.getUser().chainCd });
        // 응답 구조가 res.result라면 그대로 대입
        if (res?.data?.result) {
            categories.value = res.data?.result;
        }
    } catch (e: any) {
        console.error(e.message);
    }
};

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
                        v-for="i in categories.lclsCategory"
                        :key="i.categoryCd"
                        :value="i.categoryCd"
                    >
                        {{ i.categoryNm }}
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
                    <option v-for="i in filteredMcls" :key="i.categoryCd" :value="i.categoryCd">
                        {{ i.categoryNm }}
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
                    <option v-for="i in filteredScls" :key="i.categoryCd" :value="i.categoryCd">
                        {{ i.categoryNm }}
                    </option>
                </select>
            </div>
        </div>
    </li>
</template>
