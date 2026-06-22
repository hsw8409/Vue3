/**
 * @file     /service/auth.ts
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 * 로그인 및 로그아웃
 */
import TokenService from '@/common/service/token';
import { utils } from '@/common/utils';
import type { TokenProps } from '@/types/auth';
import type { LoginRegProps, UserProps } from '@/types/auth';
import { login, logout } from '@/api/auth';

class AuthService {
    async login(user: LoginRegProps) {
        const res = await login(user);

        const loginUser: UserProps = res.data.result.user;
        const token: TokenProps = res.data.result.token;

        if (loginUser && token) {
            TokenService.setUser(loginUser);
            TokenService.setToken(token);
        }

        return loginUser;
    }

    async logout(): Promise<boolean> {
        const user = TokenService.getUser();

        if (utils.obj.isBlank(user)) {
            TokenService.logout();
            return true;
        }

        await logout(user);

        TokenService.logout();
        return true;
    }
}

export default new AuthService();
