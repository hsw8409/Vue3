/**
 * @file     /service/token.ts
 * @menu     토큰 서비스
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 */

// ==================================================
// import 영역
// ==================================================
import type { UserProps } from '@/types/auth'; // 권한 타입
import type { TokenProps } from '@/types/token'; // 토큰 타입

class TokenService {
    // accessToken 가져오기
    getLocalAccessToken(): string | undefined {
        const token = this.getToken();
        return token?.accessToken;
    }
    // refreshToken 가져오기
    getLocalRefreshToken(): string | undefined {
        const token = this.getToken();
        return token?.refreshToken;
    }

    //
    updateLocalAccessToken(accessToken: string): void {
        const token = this.getToken();

        if (!token) {
            return;
        }

        token.accessToken = accessToken;
        sessionStorage.setItem('token', JSON.stringify(token));
    }

    // 사용자 정보 가져오기
    getUser(): UserProps {
        const user = sessionStorage.getItem('user');
        return JSON.parse(user as string) as UserProps;
    }

    // 토큰 정보 가져오기
    getToken(): TokenProps | null {
        const token = sessionStorage.getItem('token');
        return token ? (JSON.parse(token) as TokenProps) : null;
    }

    // 사용자 정보 셋팅
    setUser(user: UserProps): void {
        sessionStorage.setItem('user', JSON.stringify(user));
    }

    // 토큰 정보 셋팅
    setToken(token: TokenProps): void {
        sessionStorage.setItem('token', JSON.stringify(token));
    }

    // 사용자 정보 삭제
    removeUser(): void {
        sessionStorage.removeItem('user');
    }

    // 토큰 정보 삭제
    removeToken(): void {
        sessionStorage.removeItem('token');
    }

    // 로그아웃 - 사용자, 토큰 삭제
    logout(): void {
        this.removeUser();
        this.removeToken();
    }
}

export default new TokenService();
