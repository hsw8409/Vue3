/**
 * @file     /stores/auth.ts
 * @menu     인증 상태 관리 store
 * @author   astems
 * @since    2026-06-23
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { defineStore } from 'pinia';
import AuthService from '@/common/service/auth';
import TokenService from '@/common/service/token';
import type { UserProps } from '@/types/auth';

// =====================================================================================================
// Type 선언
// =====================================================================================================
interface AuthState {
    user: UserProps | null;
    isAuthenticated: boolean;
    isLoggedOut: boolean;
}

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
export const useAuthStore = defineStore('auth', {
    // 1. State
    state: (): AuthState => ({
        user: TokenService.getUser() || null,
        isAuthenticated: !!(TokenService.getUser() && TokenService.getToken()),
        isLoggedOut: false,
    }),

    // 2. Getters
    getters: {
        isLoggedIn: (state): boolean => !!state.user && state.isAuthenticated,
        getUser: (state): UserProps | null => state.user,
    },

    // 3. Actions
    actions: {
        // 로그인 처리
        async login(user: UserProps) {
            try {
                const res = await AuthService.login(user);
                this.user = res;
                this.isAuthenticated = true;
                this.isLoggedOut = false;
                return res;
            } catch (error) {
                this.resetState();
                throw error;
            }
        },

        // 로그아웃 처리
        async logout() {
            try {
                await AuthService.logout();
            } finally {
                this.resetState();
            }
        },

        // 상태 초기화
        resetState() {
            this.user = null;
            this.isAuthenticated = false;
            this.isLoggedOut = true;
        },

        // 토큰 갱신
        refreshToken(accessToken: string) {
            if (this.user) {
                this.user.accessToken = accessToken;
            }
        },

        // 로그아웃 상태 플래그 설정
        setLoggedOut(status: boolean) {
            this.isLoggedOut = status;
        },
    },
});
