/**
 * @file     /common/axios/interceptors.ts
 * @menu     api 호출시 인터셉터 역할
 * @author   astems
 * @since    2026-06-22
 * @version  1.0
 *
 * @description
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import axiosInstance from '@/common/axios/api';
import TokenService from '@/common/service/token';
import { log } from '@/common/utils/log';
import { useLoadingStore } from '@/common/stores/loadingState';
import { useAuthStore } from '@/common/stores/auth';

// =====================================================================================================
// Type 선언 영역
// =====================================================================================================
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/api';

type Mitt = {
    emit: (event: string, payload?: any) => void;
};

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
    isTokenNull?: boolean;
}

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================

// -------------------- state --------------------
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// -------------------- logout --------------------
let logoutTriggered = false;
let isLoggingOut = false;

// -------------------- error codes --------------------
const code = {
    unauthorized: 401,
    access_invalid: 1101,
    refresh_invalid: 1201,
    field_invalid: 2001,
};

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
const onRefreshed = (newAccessToken: string) => {
    refreshSubscribers.forEach((cb) => cb(newAccessToken));
    refreshSubscribers = [];
};

const addSubscriber = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

// -------------------- setup --------------------
const setup = (mitt: Mitt): void => {
    axiosInstance.interceptors.request.use(
        (config: CustomAxiosRequestConfig) => {
            const authStore = useAuthStore();
            const loadingStore = useLoadingStore();

            if (authStore.isLoggedOut && config.url !== '/api/v1/login') {
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
            return res;
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

                            const authStore = useAuthStore();
                            authStore.refreshToken(accessToken);

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

const logout = (mitt: Mitt, showPopup = true, msg = '세션 만료'): void => {
    const logoutByPopup = async () => {
        if (isLoggingOut) return;
        isLoggingOut = true;

        try {
            const authStore = useAuthStore();
            await authStore.logout();
            authStore.$reset();

            localStorage.removeItem('accessToken');
            sessionStorage.clear();
        } catch (e) {
            console.error('logout 에러:', e);
        } finally {
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
