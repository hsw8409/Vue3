/**
 * @file     /common/stores/auth.ts
 * @menu     인증 상태 관리 store
 * @author   astems
 * @since    2026-06-23
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import AuthService from '@/common/service/auth';
import TokenService from '@/common/service/token';
import type { UserProps } from '@/types/auth';

// =====================================================================================================
// Type 선언
// =====================================================================================================

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref<UserProps | null>(TokenService.getUser() || null);
    const isAuthenticated = ref<boolean>(!!(TokenService.getUser() && TokenService.getToken()));
    const isLoggedOut = ref<boolean>(false);

    // Getters
    const isLoggedIn = computed(() => !!user.value && isAuthenticated.value);
    const getUser = computed(() => user.value);

    // Actions
    const resetState = () => {
        user.value = null;
        isAuthenticated.value = false;
        isLoggedOut.value = true;
    };

    const login = async (userData: UserProps) => {
        try {
            const res = await AuthService.login(userData);
            user.value = res;
            isAuthenticated.value = true;
            isLoggedOut.value = false;
            return res;
        } catch (error) {
            resetState();
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AuthService.logout();
        } finally {
            resetState();
        }
    };

    const refreshToken = (accessToken: string) => {
        if (user.value) {
            user.value.accessToken = accessToken;
        }
    };

    const setLoggedOut = (status: boolean) => {
        isLoggedOut.value = status;
    };

    return {
        user,
        isAuthenticated,
        isLoggedOut,
        isLoggedIn,
        getUser,
        login,
        logout,
        resetState,
        refreshToken,
        setLoggedOut,
    };
});
