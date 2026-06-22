<script>
import TokenService from '@/common/service/token';

import UI_MOB_002 from '@/components/mobile/UI_MOB_002.vue';
import UI_MOB_002P01 from '@/components/mobile/UI_MOB_002P01.vue';
import UI_MOB_003 from '@/components/mobile/UI_MOB_003.vue';
import UI_MOB_003P01 from '@/components/mobile/UI_MOB_003P01.vue';
import UI_MOB_004 from '@/components/mobile/UI_MOB_004.vue';
import UI_MOB_004P01 from '@/components/mobile/UI_MOB_004P01.vue';
import UI_MOB_005 from '@/components/mobile/UI_MOB_005.vue';
import UI_MOB_005P01 from '@/components/mobile/UI_MOB_005P01.vue';

import MENU from '@/components/mobile/mobileMenu.vue';
import Popup from '@/common/utils/popup/popup.vue';
import { openAlert, openPopup } from '@/common/utils/popup/popup.helper';

export default {
    name: 'MainView',
    components: {
        UI_MOB_002: UI_MOB_002,
        UI_MOB_002P01: UI_MOB_002P01,
        UI_MOB_003: UI_MOB_003,
        UI_MOB_003P01: UI_MOB_003P01,
        UI_MOB_004: UI_MOB_004,
        UI_MOB_004P01: UI_MOB_004P01,
        UI_MOB_005: UI_MOB_005,
        UI_MOB_005P01: UI_MOB_005P01,
        MENU: MENU,
        Popup,
    },
    data() {
        return {
            userNm: '',
            currentComponent: 'MENU',
            beforeComponent: 'MENU',
            propsData: {},
            tabs: [],
        };
    },
    mounted() {
        const loginUser = TokenService.getUser();
        this.userNm = loginUser.userNm;
        this.$emitter.on('errorMessageEvent', this.axiosError);

        //팝업 전역 핸들러 연결
        window.popupRef = this.$refs.popupRef;

        this.$api
            .post('/api/v1/main/selectCommCd')
            .then((res) => {
                for (let key in res?.result) {
                    localStorage.setItem(key, JSON.stringify(res?.result[key]));
                }
            })
            .catch((e) => {
                return e;
            });
    },
    unmounted() {
        this.$emitter.off('errorMessageEvent');
    },
    methods: {
        // 페이지 이동
        goPage(param) {
            const name = param.target._value;
            this.currentComponent = name;
            if (!this.tabs.includes(name)) {
                this.tabs.push(name);
            }
            this.beforeComponent = name && name.length > 10 ? name.substr(0, 10) : 'MENU';
            this.propsData = param?.props;
        },
        goBack() {
            this.currentComponent = this.beforeComponent;
            if (
                this.currentComponent == 'UI_MOB_002' ||
                'UI_MOB_003' ||
                'UI_MOB_004' ||
                'UI_MOB_005'
            ) {
                this.beforeComponent = 'MENU';
            }
            if (this.currentComponent == 'MENU') {
                // this.tabs = [];
            }
        },
        success() {
            this.currentComponent = this.currentComponent.substr(0, 10);
            this.tabs = [this.currentComponent.substr(0, 10)];
            this.beforeComponent = 'MENU';
        },
        axiosError(prop) {
            console.log('🔥 popup 호출 전 componentType 확인:', prop.componentType);
            openAlert('[' + prop.type + ']\n' + prop.msg, prop.ok);
        },
        logout() {
            openPopup({
                type: 'mobileConfirm', // 필요하면 custom 처리 가능
                componentType: 'mobileMsg',
                msg: '로그아웃 하시겠습니까?',
                ok: () => {
                    this.$store.dispatch('auth/logout').then(() => {
                        this.$router.push('/mlogin');
                    });
                },
            });
        },
    },
};
</script>
<template>
    <div id="mobileHeader" class="btn_area_m">
        <div class="displayFlex">
            <button type="button" class="mobileBack" @click="goBack">
                <span>뒤로가기</span>
            </button>
            <div class="displayFlex">
                <div class="userImg"></div>
                <span class="userNm">{{ userNm }}</span>
            </div>
        </div>
        <div class="displayFlex">
            <button type="button" class="logoutBorder" @click.prevent="logout">
                <div class="logoutImg"></div>
            </button>
        </div>
        <!-- <div class="PersonalMenu">
                <button type="button" class="name">
                    <span>{{ userNm }}</span>
                </button>
            <button @click.prevent="logout" type="button" class="logout">
                <span>LOGOUT</span>
            </button>
        </div> -->
        <!-- <button type="button" class="default mob_default">
                <span>로그아웃</span>
            </button> -->
    </div>
    <div id="wrapM">
        <suspense>
            <template #default>
                <keep-alive :include="tabs">
                    <component
                        :is="currentComponent"
                        :props="propsData"
                        @go-page="goPage"
                        @go-page:success="success"
                        @go-back="goBack"
                    ></component>
                </keep-alive>
            </template>
            <template #fallback>
                <div>Loading...</div>
            </template>
        </suspense>
        <Popup ref="popupRef" />
    </div>
</template>
