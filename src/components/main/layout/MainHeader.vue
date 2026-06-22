<script setup lang="ts">
/*
 * @file     VueHeader.vue
 * @menu     상단 공통 헤더
 * @author   astems
 * @since    2026-06-17
 * @version  1.1 (TypeScript 안정성 및 팝업 규격 보정)
 */

// ==================================================
// import 영역
// ==================================================
import { computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/common/stores/auth';
import { usePopupStore } from '@/common/stores/popup';
import TokenService from '@/common/service/token';

// ==================================================
// 변수 선언 영역
// ==================================================
const router = useRouter();
const auth = useAuthStore();
const popup = usePopupStore();

// 부모로부터 주입받은 유저 정보 (기본값 설정)
const loginUser = inject<any>('loginUser', {});

// 마이페이지 팝업용 고정 파라미터 (안전하게 계산되도록 맵핑)
const searchParameter = {
    userId: TokenService.getUser()?.userId || '',
    userNm: TokenService.getUser()?.userNm || '',
};

// 소속 체인명 계산 (실시간 로컬스토리지 추적용 computed)
const chainNm = computed<string>(() => String(TokenService.getUser()?.chainNm || ''));

// ==================================================
// 사용자 정의 함수 영역 (Methods)
// ==================================================
// 로그아웃 처리
const logout = () => {
    // 💡 이전 팝업 스토어 규격(세 번째 인자 옵션 객체)에 맞춰 확실하게 바인딩
    popup.confirm('로그아웃 하시겠습니까?', undefined, {
        onOk: async () => {
            try {
                await auth.logout();
                // 모든 활성화된 팝업이 있다면 일괄 닫기(선택 사항) 후 이동
                router.push('/login');
            } catch (error) {
                console.error('Logout Error:', error);
            }
        },
    });
};

// 마이페이지 정보 수정 팝업 오픈
const myPage = () => {
    popup.openPopup('biz', 'UI_USR_P03', {
        props: searchParameter,
        width: 1200,
        height: 500,
    });
};
</script>

<template>
    <div id="gnb" class="no-print">
        <div style="display: flex; min-width: fit-content">
            <h1><a href="/">Astems</a></h1>
            <span class="program_name">Vue3</span>
        </div>
        <div class="PersonalMenu">
            <span class="chain_name">
                {{ chainNm }}
            </span>
            <button type="button" class="name" @click="myPage">
                <span>{{ loginUser?.userNm || searchParameter.userNm }}</span>
            </button>
            <button type="button" class="logout" @click.prevent="logout">
                <span>LOGOUT</span>
            </button>
        </div>
    </div>
</template>
