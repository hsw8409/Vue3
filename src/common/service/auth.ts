/**
 * @file     /service/auth.ts
 * @menu     로그인 서비스
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import TokenService from '@/common/service/token'; // 토큰 서비스

import { utils } from '@/common/utils'; // 유틸

import type { UserProps, TokenProps } from '@/types/auth'; // 권한 타입

import { login, logout } from '@/api/auth'; // api

class AuthService {
    /**
     * 로그인 서비스
     *
     */
    async login(user: UserProps): Promise<UserProps> {
        const res = await login(user);

        // API 응답 구조를 안전하게 확인
        const result = res?.data?.result;

        if (!result || !result.user || !result.token) {
            throw new Error('로그인 응답 데이터가 올바르지 않습니다.');
        }

        const loginUser: UserProps = result.user;
        const token: TokenProps = result.token;

        loginUser.accessToken = token.accessToken;

        // 로컬 저장소에 저장
        TokenService.setUser(loginUser);
        TokenService.setToken(token);

        return loginUser;
    }

    /**
     * 로그아웃 서비스
     *
     */
    async logout(): Promise<boolean> {
        try {
            const user = TokenService.getUser();

            // 사용자 정보가 존재하고 유효한 경우에만 서버 로그아웃 호출
            if (user && !utils.obj.isBlank(user)) {
                await logout(user);
            }
        } catch (error) {
            console.error('로그아웃 API 호출 중 오류 발생:', error);
        } finally {
            TokenService.logout();
        }

        return true;
    }
}

export default new AuthService();
