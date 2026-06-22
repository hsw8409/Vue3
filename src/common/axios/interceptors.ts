import axiosInstance from '@/common/axios/api';
import TokenService from '@/common/service/token';
import { log } from '@/common/utils/log';
import { useLoadingStore } from '@/common/stores/loadingState';
import { useAuthStore } from '@/common/stores/auth';

import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

type Mitt = {
    emit: (event: string, payload?: any) => void;
};

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
    isTokenNull?: boolean;
}

interface ApiResponse<T = any> {
    code?: number;
    message?: string;
    result?: T;
}

// -------------------- state --------------------
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(newAccessToken: string) {
    refreshSubscribers.forEach((cb) => cb(newAccessToken));
    refreshSubscribers = [];
}

function addSubscriber(cb: (token: string) => void) {
    refreshSubscribers.push(cb);
}

// -------------------- error codes --------------------
const code = {
    unauthorized: 401,
    access_invalid: 1101,
    refresh_invalid: 1201,
    field_invalid: 2001,
};

// -------------------- setup --------------------
const setup = (mitt: Mitt): void => {
    axiosInstance.interceptors.request.use(
        (config: CustomAxiosRequestConfig) => {
            const auth = useAuthStore();
            const loadingStore = useLoadingStore();

            if (auth.isLoggedOut && config.url !== '/api/v1/login') {
                return Promise.reject(new Error('로그아웃 상태에서 요청이 차단되었습니다'));
            }

            loadingStore.incrementLoading();
            log.info(`[${config.method?.toUpperCase()}] URL[ ${config.url} ]`);

            if (config.url !== '/api/v1/login' && config.url !== '/api/v1/token/refresh') {
                const token = TokenService.getLocalAccessToken();
                if (token) {
                    config.headers = config.headers ?? {};
                    config.headers['AccessToken'] = token;
                } else {
                    config.isTokenNull = true;
                }
            }

            return config;
        },
        (error: any) => {
            const loadingStore = useLoadingStore();
            loadingStore.decrementLoading();
            return Promise.reject(error);
        },
    );

    axiosInstance.interceptors.response.use(
        (res: AxiosResponse): any => {
            const loadingStore = useLoadingStore();
            loadingStore.decrementLoading();

            if (res.config.url === '/api/v1/login' || res.config.url === '/api/v1/token/refresh') {
                return res;
            }

            return res.data;
        },

        async (err: AxiosError<ApiResponse>): Promise<any> => {
            const loadingStore = useLoadingStore();
            loadingStore.decrementLoading();

            log.error(err);

            const conv = err.response?.data;
            const originalConfig = err.config as CustomAxiosRequestConfig;

            if (!originalConfig || !originalConfig.url) {
                return Promise.reject(err);
            }

            // 💡 패스 조건 보강: 로그인 및 토큰 갱신 주소 자체에서 에러가 난 경우는 재발급 로직 진입 원천 차단
            const isAuthApi =
                originalConfig.url === '/api/v1/login' ||
                originalConfig.url === '/api/v1/token/refresh';

            if (!isAuthApi && err.response) {
                // ---------------- access token expired ----------------
                if (conv?.code === code.access_invalid && !originalConfig._retry) {
                    originalConfig._retry = true;

                    if (!isRefreshing) {
                        isRefreshing = true;
                        const refreshToken = TokenService.getLocalRefreshToken();

                        try {
                            const rs = await axiosInstance.post<
                                ApiResponse<{ accessToken: string }>
                            >(
                                '/api/v1/token/refresh',
                                {},
                                {
                                    headers: {
                                        RefreshToken: refreshToken,
                                    },
                                },
                            );

                            const accessToken = rs.data?.result?.accessToken;
                            if (!accessToken) throw new Error('No accessToken');

                            TokenService.updateLocalAccessToken(accessToken);

                            const auth = useAuthStore();
                            auth.refreshToken(accessToken);

                            isRefreshing = false;
                            onRefreshed(accessToken);

                            originalConfig.headers = originalConfig.headers ?? {};
                            originalConfig.headers['AccessToken'] = accessToken;

                            return axiosInstance(originalConfig);
                        } catch (e: any) {
                            isRefreshing = false;
                            refreshSubscribers = [];

                            logout(mitt, true, 'RefreshToken 만료 또는 유효하지 않음');
                            return Promise.reject(e?.response?.data || e);
                        }
                    }

                    // queue
                    return new Promise((resolve) => {
                        addSubscriber((newAccessToken) => {
                            originalConfig.headers = originalConfig.headers ?? {};
                            originalConfig.headers['AccessToken'] = newAccessToken;
                            resolve(axiosInstance(originalConfig));
                        });
                    });
                }

                // ---------------- refresh token expired ----------------
                if (conv?.code === 1201 || conv?.code === 1202) {
                    if (!logoutTriggered) {
                        logout(mitt, true, conv?.message ?? '');
                    }
                    return Promise.reject(err.response?.data);
                }

                // ---------------- unauthorized ----------------
                if (conv?.code === code.unauthorized) {
                    log.info('[JWT] ' + conv?.message);
                    logout(mitt, true, conv?.message ?? '');
                    return Promise.reject(err.response?.data);
                }

                // ---------------- fallback ----------------
                if (
                    !conv?.code &&
                    err.response?.status === 500 &&
                    err.response?.data?.message?.includes('토큰 갱신')
                ) {
                    log.warn('[JWT] 토큰 갱신 실패로 추정');
                    logout(mitt, true, err.response.data.message);
                    return Promise.reject(err.response.data);
                }
            }

            // ---------------- field invalid ----------------
            if (conv?.code === code.field_invalid) {
                mitt.emit('errorMessageEvent', {
                    type: 'info',
                    msg: conv.message,
                });
            }

            // 💡 수정 완료: 단순히 return 처리하면 프라미스 체인이 끊기므로 명확하게 Reject를 넘겨줍니다.
            if (conv?.code === code.access_invalid) {
                return Promise.reject(err);
            }

            return Promise.reject(conv ?? err);
        },
    );
};

// -------------------- logout --------------------
let logoutTriggered = false;
let isLoggingOut = false;

const logout = (mitt: Mitt, showPopup = true, msg = '세션 만료'): void => {
    const logoutByPopup = async () => {
        if (isLoggingOut) return;
        isLoggingOut = true;

        try {
            const auth = useAuthStore();
            await auth.logout();
            auth.$reset();

            localStorage.removeItem('accessToken');
            sessionStorage.clear();
        } catch (e) {
            console.error('logout 에러:', e);
        } finally {
            console.info('로그아웃 및 대피 절차 진입');
            isLoggingOut = false;
            logoutTriggered = false; // 플래그 초기화

            // 브라우저 세션을 완벽히 밀어버리며 라우팅
            window.location.replace('/login');
        }
    };

    const popupProp = {
        type: 'fnAlert',
        componentType: 'fnAlert',
        msg: `접근 권한이 없습니다.\n[${msg}]`,
        ok: logoutByPopup,
    };

    if (logoutTriggered) {
        mitt.emit('errorMessageEvent', popupProp);
        return;
    }

    logoutTriggered = true;

    if (showPopup) {
        const popupRef = (window as any)?.popupRef;
        if (popupRef?.msgShow && popupRef?.localType === 'fnAlert') {
            return;
        }
        mitt.emit('errorMessageEvent', popupProp);
    } else {
        popupProp.ok();
    }
};

export default setup;
