<script setup lang="ts">
/*
 * @file     MenuTop.vue
 * @menu     업무화면 상단
 * @author   astems
 * @since    2026-06-22
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import TokenService from '@/common/service/token';
import { biz } from '@/common/utils/biz';
import { selectFavoriteMenu } from '@/api/favorite';
import { useFavoriteStore } from '@/common/stores/favorite';
import type { SelectedMenuProps } from '@/types/menu';

// ==================================================
// 타입 정의 영역 (TypeScript Type Interfaces)
// ==================================================

interface ButtonItem {
    btnNm: string;
    btnFnc: string;
    btnIcon?: string;
    disabled: boolean;
}

// ==================================================
// 컴포넌트 Props 정의
// ==================================================
const props = defineProps<{
    menuInfo?: SelectedMenuProps;
    methods?: Record<string, () => void>;
    params?: Record<string, any>;
}>();

// 다국어 메시지 훅
const { t } = useI18n();

// 즐겨찾기 UI 상태 구조 조정
const favorite = reactive({
    onOffFlag: false,
    on: 'btn_favorite on',
    off: 'btn_favorite off',
});

// 로그인 사용자 정보
const loginUser = TokenService.getUser();

// 공통 버튼 리스트 정적 타이핑
const btnList = ref<ButtonItem[]>([]);
const favStore = useFavoriteStore();

// ==================================================
// 사용자 정의 함수 영역 (Methods)
// ==================================================
// 공통 버튼 클릭 시 부모가 전달한 함수(methods) 매핑 실행
const ButtonEvent = (fncName: string) => {
    if (!props.methods) return;
    const fnc = props.methods[fncName];
    if (typeof fnc === 'function') {
        fnc();
    }
};

// 즐겨찾기 토글 (추가/삭제)
const favoriteToggle = async () => {
    const menuCd = props.menuInfo?.mcd;
    if (!menuCd || !loginUser?.userId) return;

    try {
        // 스토어 액션 호출: 여기서 알아서 API 호출 후 목록을 갱신함
        await favStore.toggleFavorite(loginUser.userId, menuCd, favorite.onOffFlag);

        // 버튼 상태값만 로컬에서 반전
        favorite.onOffFlag = !favorite.onOffFlag;
    } catch (error) {
        // 에러 핸들링
        console.info('error>>', error);
    }
};

// 즐겨찾기 상태 실시간 동기화 업데이트
const updateFavoriteState = async () => {
    const menuCd = props.menuInfo?.mcd;
    if (!menuCd) return;

    try {
        const list = await selectFavoriteMenu().then((res) => res?.data?.result || []);
        favorite.onOffFlag = list.some((item: any) => item.pmenuCd === menuCd);
    } catch (error) {
        console.error('Fetch Favorite State Error:', error);
    }
};

// 버튼 비활성화 (부모 컴포넌트 호출용 외부 노출)
const setDisabled = (sIndex: number) => {
    if (btnList.value[sIndex]) {
        btnList.value[sIndex] = {
            ...btnList.value[sIndex],
            disabled: true, // 💡 객체 깊은 복사 재할당 구조로 Vue 3 반응성 확실히 보장
        };
    }
};

// 버튼 활성화 (부모 컴포넌트 호출용 외부 노출)
const setEnabled = (sIndex: number) => {
    if (btnList.value[sIndex]) {
        btnList.value[sIndex] = {
            ...btnList.value[sIndex],
            disabled: false,
        };
    }
};

defineExpose({
    setDisabled,
    setEnabled,
});

// ==================================================
// Hook 및 Watcher 영역
// ==================================================
watch(
    // 💡 안전하게 옵셔널 체이닝(?.) 추가하여 빈 데이터 진입 시 발생하는 런타임 터짐 방지
    () => props.menuInfo?.mcd,
    (newCd) => {
        if (!newCd) {
            btnList.value = [];
            return;
        }
        const menuBtnList = biz.MENU_COM_BTN?.find((item: any) => item.mcd === newCd);
        btnList.value =
            menuBtnList?.btnList?.map((btn: any) => ({
                ...btn,
                disabled: false,
            })) || [];
    },
    { immediate: true },
);

onMounted(() => {
    updateFavoriteState();
});
</script>

<template>
    <div class="title">
        <div class="titleWrap">
            <div class="pageTitle">
                <button
                    type="button"
                    :class="favorite.onOffFlag ? favorite.on : favorite.off"
                    @click="favoriteToggle"
                />
                <h2 :title="menuInfo?.fileNm">{{ menuInfo?.sname }}</h2>
            </div>
            <div class="breadcrumb">
                <button type="button">
                    <span class="a11y">{{ t('menu.label.moveFirst') }}</span>
                </button>
                <span>{{ menuInfo?.lname }}</span>
                <span>{{ menuInfo?.mname }}</span>
                <span>{{ menuInfo?.sname }}</span>
            </div>
        </div>

        <div class="menuButton">
            <button
                v-for="(btn, index) in btnList"
                :key="index"
                type="button"
                class="default"
                :disabled="btn.disabled"
                @click="ButtonEvent(btn.btnFnc)"
            >
                <span>{{ btn.btnIcon ? btn.btnIcon + ' ' : '' }}{{ btn.btnNm }}</span>
            </button>
        </div>
    </div>
</template>
