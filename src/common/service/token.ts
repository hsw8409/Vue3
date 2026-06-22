import type { TokenProps } from '@/types/auth';
import type { UserProps } from '@/types/auth';

class TokenService {
    getLocalAccessToken(): string | undefined {
        const token = this.getToken();
        return token?.accessToken;
    }

    getLocalRefreshToken(): string | undefined {
        const token = this.getToken();
        return token?.refreshToken;
    }

    updateLocalAccessToken(accessToken: string): void {
        const token = this.getToken();

        if (!token) {
            return;
        }

        token.accessToken = accessToken;
        sessionStorage.setItem('token', JSON.stringify(token));
    }

    getUser(): UserProps {
        const user = sessionStorage.getItem('user');
        return JSON.parse(user as string) as UserProps;
    }

    getToken(): TokenProps | null {
        const token = sessionStorage.getItem('token');
        return token ? (JSON.parse(token) as TokenProps) : null;
    }

    setUser(user: UserProps): void {
        sessionStorage.setItem('user', JSON.stringify(user));
    }

    setToken(token: TokenProps): void {
        sessionStorage.setItem('token', JSON.stringify(token));
    }

    removeUser(): void {
        sessionStorage.removeItem('user');
    }

    removeToken(): void {
        sessionStorage.removeItem('token');
    }

    logout(): void {
        this.removeUser();
        this.removeToken();
    }
}

export default new TokenService();
