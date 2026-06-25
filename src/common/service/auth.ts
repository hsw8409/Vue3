/**
 * @file    /service/auth.ts
 * @author  astems
 * @since    2026-06-17
 * @version  1.1
 *
 * @description 로그인 및 로그아웃 서비스 로직 (타입 안전성 강화)
 */
import TokenService from '@/common/service/token';
import { utils } from '@/common/utils';
import { login, logout } from '@/api/auth';
import type { UserProps } from '@/types/auth';
import type { TokenProps } from '@/types/token';

class AuthService {
    /**
     * 로그인 서비스
     * @param user 사용자 정보
     * @returns Promise<UserProps>
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

        // 토큰 정보를 유저 객체에 통합하여 스토어에서 사용하기 쉽게 함
        loginUser.accessToken = token.accessToken;

        // 로컬 저장소에 저장
        TokenService.setUser(loginUser);
        TokenService.setToken(token);

        return loginUser;
    }

    /**
     * 로그아웃 서비스
     * @returns Promise<boolean>
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
            // 에러가 발생해도 로컬 토큰은 삭제하여 강제 로그아웃 처리
        } finally {
            TokenService.logout();
        }

        return true;
    }
}

export default new AuthService();
