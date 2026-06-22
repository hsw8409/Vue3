/**
 * @file     /store/auth.ts
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 * 권한관리 관련 API (Vuex -> Pinia 완벽 이관 버전)
 */
import { defineStore } from 'pinia';
import AuthService from '@/common/service/auth';
import TokenService from '@/common/service/token';
import type { LoginRegProps } from '@/types/auth';

interface AuthState {
    user: LoginRegProps | null;
    isLoggedOut: boolean;
    loggedIn: boolean;
}

export const useAuthStore = defineStore('auth', {
    // 1. State: 초기값 설정 로직 완벽 동기화
    state: (): AuthState => {
        const user = TokenService.getUser();
        const token = TokenService.getToken();
        return {
            user: user || null,
            loggedIn: !!(user && token),
            isLoggedOut: false,
        };
    },

    // 2. Getters
    getters: {
        isLoggedIn: (state) => state.loggedIn,
        getUser: (state) => state.user,
    },

    actions: {
        async login(user: LoginRegProps) {
            try {
                const res = (await AuthService.login(user)) as LoginRegProps;

                this.user = res;
                this.loggedIn = true;
                this.isLoggedOut = false;

                return res;
            } catch (error) {
                this.user = null;
                this.loggedIn = false;
                this.isLoggedOut = true;

                throw error;
            }
        },

        async logout() {
            try {
                await AuthService.logout();
            } finally {
                this.user = null;
                this.loggedIn = false;
                this.isLoggedOut = true;
            }
        },

        refreshToken(accessToken: string) {
            if (this.user) {
                this.user = { ...this.user, accessToken } as any;
            }
        },

        registerSuccess() {
            this.loggedIn = false;
        },

        registerFailure() {
            this.loggedIn = false;
        },

        resetState() {
            this.user = null;
            this.loggedIn = false;
            this.isLoggedOut = true;
        },

        setLoggedOut(status: boolean) {
            this.isLoggedOut = status;
        },
    },
});
