import { defineComponent } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import TokenService from '@/common/service/token';
import AuthService from '@/common/service/auth';
import { tokenCheck } from '@/api/main';

const NotFound = defineComponent({ template: '<div>Not Found</div>' });

const routes = [
    {
        path: '/',
        name: 'root',
        redirect: '/main',
        children: [
            // ⭕ mlogin을 children 내부로 이동
            {
                path: '/mlogin',
                name: 'mlogin',
                component: () => import('@/components/mobile/login.vue'),
            },
            {
                path: '/login',
                name: 'login',
                component: () => import('@/components/login/LoginPage.vue'),
            },
            {
                path: '/main',
                name: 'main',
                component: () => import('@/components/main/MainPage.vue'),
                children: [],
            },
            {
                path: '/mobile',
                name: 'mobile',
                component: () => import('@/components/mobile/mobileMain.vue'),
            },
        ],
    },
    {
        path: '/:catchAll(.*)+',
        component: NotFound,
    },
];

const router = createRouter({
    history: createWebHistory(),
    linkActiveClass: 'active',
    routes,
});

router.beforeEach(async (to, from, next) => {
    const isMobile = /iPhone|Android/i.test(navigator.userAgent);

    const token = TokenService.getToken()?.accessToken;
    const refreshToken = TokenService.getToken()?.refreshToken;

    const isAuthenticated = !!token;
    const isLoginPage = to.path === '/login' || to.path === '/mlogin';

    // ✅ logout 함수 (Pinia 방식)
    const logout = async () => {
        try {
            await AuthService.logout(); // 🔥 Vuex dispatch → Pinia action

            if (isLoginPage) {
                return next();
            }

            return next(isMobile ? '/mlogin' : '/login');
        } catch (e) {
            console.error('logout error', e);

            return next(isMobile ? '/mlogin' : '/login');
        }
    };

    // 0. 모바일 분기
    if (to.path === '/main' && isMobile) {
        return next('/mobile');
    }

    if (to.path === '/mobile' && !isMobile) {
        return next('/main');
    }

    // 1. root 분기
    if (to.path === '/') {
        return next(
            isAuthenticated ? (isMobile ? '/mobile' : '/main') : isMobile ? '/mlogin' : '/login',
        );
    }

    // 2. 비로그인 차단
    if (!isAuthenticated && !isLoginPage) {
        return logout();
    }

    // 3. 로그인 상태에서 로그인 페이지 접근
    if (isAuthenticated && isLoginPage) {
        if (from.name && from.name !== 'logout') {
            return next(isMobile ? '/mobile' : '/main');
        }
    }

    // 4. 토큰 검증
    if (isAuthenticated && (to.meta.requiresAuth || to.path === '/main' || to.path === '/mobile')) {
        try {
            const res = await tokenCheck({
                headers: {
                    Authorization: `Bearer ${token}`,
                    RefreshToken: refreshToken,
                },
            });

            if (res?.data?.result === 'fail') return logout();
        } catch (e) {
            console.error('token check error', e);
            return logout();
        }
    }

    return next();
});

export default router;
