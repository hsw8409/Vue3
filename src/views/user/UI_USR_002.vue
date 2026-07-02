<script setup lang="ts">
/*
 * @file     UI_USR_002.vue
 * @menu     사용자 등록 및 수정
 * @author   astems
 * @since    2026-06-26
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { inject, onActivated, reactive, ref, watch, computed } from 'vue';
import TokenService from '@/common/service/token';
import crypto from '@/common/service/crypto.js';
import { utils } from '@/common/utils';
import { useI18n } from 'vue-i18n'; // 다국어
import dayjs from 'dayjs';

// 공통모듈
import AddressFind from '@/components/etc/AddressFind.vue'; // 주소찾기
import EmailAddress from '@/components/etc/EmailAddress.vue'; // 이메일
import MenuTop from '@/components/menu/MenuTop.vue'; // 메뉴&메뉴 공통 버튼 (데이터 기반으로 전체 )
import MenuContent from '@/components/menu/MenuContent.vue'; // 메뉴 메인
import ComInputbox from '@/components/form/ComInputbox.vue'; // 텍스트 box
import ComSelectbox from '@/components/form/ComSelectbox.vue'; // 선택박스 box
import ComButton from '@/components/form/ComButton.vue';
import ComDateSelect from '@/components/form/ComDateSelect.vue'; // 달력
import CustCdAndNameSearch from '@/components/search/CustCdAndNameSearch.vue'; //거래처

import { usePopupStore } from '@/common/stores/popup';

// api
import { selectMenuGroupUsing } from '@/api/menu'; //backend
import { checkUserIdDuplication, insertUser, selectUser, updateUser } from '@/api/user'; //backend

import type { UserProps } from '@/types/auth';

interface PageParams {
    userId?: string;
    mode?: 'new' | 'edit';
}

// ==================================================
// 변수 선언 영역
// ==================================================

// 메인화면은 필수 - 메뉴정보를 받기 위한 props
const props = defineProps<{
    menuInfo: any;
    params: PageParams;
}>();

// 메세지 변수
const { t } = useI18n();

const enterDate = ref<Date | null>(null);
const leaveDate = ref<Date | null>(null);

const EAT050 = JSON.parse(localStorage.getItem('EAT050') ?? '[]');
const EAT100 = JSON.parse(localStorage.getItem('EAT100') ?? '[]');
const EAT150 = JSON.parse(localStorage.getItem('EAT150') ?? '[]');

const popup = usePopupStore();

const menuGroupList = ref();

const user = ref<Partial<UserProps>>({
    userId: '',
    userNm: '',
    passwd: '',
    telNo: '',
    hpNo: '',
    email: '',
    zipno: '',
    roadAddr: '',
    roadDtlAddr: '',
    employGbnFg: '10',
    userTypeCd: '', // 사용자유형
    userCustCd: '', // 사용자 거래처
    menuGrpCd: '',
    deptCd: '',
    enterDate: '',
    leaveDate: '',
    loginChainCd: '',
    custCd: '',
    custNm: '',
    custTypeCd: '',
});

const custParam = ref({
    custCd: '',
    custNm: '',
    userTypeCd: '',
});

const emailId = ref('');
const selectedEmail = ref('gmail.com');

//ID 중복 확인 플래그
let idCheckFg = false;

let updateCheckFg = 'C';

//비밀번호체크
const passwdChk = ref<string | null>(null);

// 자동 등록 사용자의 경우 거래체 메뉴그룹 수정 불가
const disableChangeDetail = reactive({
    disableFlag: false,
    disableDept: false,
});

const addressInfo = computed({
    get: () => ({
        zipno: user.value.zipno ?? '',
        roadAddr: user.value.roadAddr ?? '',
        roadDtlAddr: user.value.roadDtlAddr ?? '',
    }),

    set: (value) => {
        user.value.zipno = value.zipno;
        user.value.roadAddr = value.roadAddr;
        user.value.roadDtlAddr = value.roadDtlAddr;
    },
});

const addTab = inject<(params: any) => Promise<boolean>>('addTab');

// ==================================================
// 사용자 정의 함수 영역
// ==================================================

// 초기화
const reset = function () {
    updateCheckFg = 'C';
    user.value = {
        userId: '',
        userNm: '',
        passwd: '',
        telNo: '',
        hpNo: '',
        email: '',
        zipno: '',
        roadAddr: '',
        roadDtlAddr: '',
        employGbnFg: '10',
        userTypeCd: '',
        userCustCd: '',
        menuGrpCd: '',
        deptCd: TokenService.getUser().role ?? '',
        enterDate: '',
        leaveDate: '',
        custCd: '',
        custNm: '',
        loginChainCd: '',
        custTypeCd: '',
    };

    Object.keys(custParam.value).forEach((key) => {
        custParam.value[key as keyof typeof custParam.value] = '';
    });

    if (passwdChk.value) {
        passwdChk.value = null;
    }
    enterDate.value = new Date();
    if (leaveDate.value) {
        leaveDate.value = null;
    }
    emailId.value = '';
    selectedEmail.value = '';

    disableChangeDetail.disableFlag = false;
};

// 사용자 조회 화면으로 이동
const pageMove = function () {
    reset();

    addTab?.({ fileNm: 'UI_USR_001.vue' });
};

// 사용자 정보 저장.
const save = async function () {
    if (TokenService.getUser().chainCd != TokenService.getUser().custCd) {
        user.value.custCd = TokenService.getUser().custCd ?? '';
    }
    // 거래처 정보 등록
    user.value.userCustCd = custParam.value.custCd;

    // 재직구분이 '퇴사'인 경우 퇴사일자는 필수
    if (user.value.employGbnFg === '30' && !leaveDate.value) {
        // 퇴사일자를 입력해주세요.
        return popup.alert(t('com.message.inputItemL', [t('user.label.leaveDate')]));
    }
    // ID중복 체크를 하지 않은 경우
    if (!idCheckFg) {
        // 사용자ID를 중복 확인을 해주세요.
        popup.alert(t('user.message.checkDuplicateUserId'));
        return;
    } else if (!(user.value.passwd == passwdChk.value) && updateCheckFg == 'C') {
        // 비밀번호를 확인해 해주세요.
        popup.alert(t('com.message.confirmItemL', [t('com.label.password')]));
        return;
    } else {
        const checkItems = [
            {
                name: t('com.label.userId'),
                value: user.value.userId,
                required: true,
                alphaNum: true,
                minLength: 4,
            }, // 사용자ID
            {
                name: t('com.label.password'),
                value: user.value.passwd,
                required: true,
                minLength: 4,
            }, // 비밀번호
            { name: t('com.label.userName'), value: user.value.userNm, required: true }, // 사용자명
            { name: t('com.label.telNo'), value: user.value.telNo, regexTel: true }, // 전화번호
            { name: t('com.label.hpNo'), value: user.value.hpNo, regexHp: true }, // 휴대폰번호
            { name: t('com.label.userType'), value: user.value.userTypeCd, required: true }, // 사용자유형
            { name: t('com.label.cust'), value: user.value.userCustCd, required: true }, // 거래처
            { name: t('menu.label.menuGroup'), value: user.value.menuGrpCd, required: true }, // 메뉴그룹
            { name: t('com.label.dept'), value: user.value.deptCd, required: true }, // 부서
            { name: t('user.label.joinDate'), value: enterDate.value, required: true }, // 입사일자
        ];

        const isValid = await utils.validator.validateBeforeSubmit(checkItems, t);
        if (isValid) {
            //거래처

            user.value.enterDate = dayjs(enterDate.value).format('YYYYMMDD');
            if (leaveDate.value) {
                user.value.leaveDate = dayjs(leaveDate.value).format('YYYYMMDD');
            }

            user.value.loginChainCd = TokenService.getUser().chainCd ?? '';

            popup.confirm(t('com.message.confirmSave'), undefined, {
                onOk: async () => {
                    if (updateCheckFg == 'C') {
                        insertUser(Object.assign(user.value, { leaveDate: leaveDate.value }))
                            .then((_res) => {
                                // 처리되었습니다.
                                popup.alert(t('com.message.processed'));
                            })
                            .catch((e) => {
                                popup.alert(e.message);
                            });
                    } else if (updateCheckFg == 'U') {
                        updateUser(
                            Object.assign(user.value, {
                                leaveDate: leaveDate.value,
                                passwd: crypto.encrypt(user.value.passwd ?? ''),
                            }),
                        )
                            .then((_res) => {
                                // 처리되었습니다.
                                popup.alert(t('com.message.processed'));
                            })
                            .catch((e) => {
                                popup.alert(e.message);
                            });
                    }
                },
            });
        } else {
            return;
        }
    }
};

const changeId = function () {
    idCheckFg = false;
};

//ID 중복 체크
const checkIdDuplication = async function () {
    // 사용자 ID 필수 체크
    const checkItems = [{ name: t('com.label.userId'), value: user.value.userId, required: true }];
    const isValid = await utils.validator.validateBeforeSubmit(checkItems, t);
    if (!isValid) {
        return;
    }

    const params = { userId: user.value.userId };
    checkUserIdDuplication(params)
        .then((res) => {
            if (res?.data?.result == 1) {
                idCheckFg = false;
                // 중복되는 사용자ID 입니다.
                popup.alert(t('user.message.duplicateUserId'));
            } else if (res?.data?.result == -1) {
                idCheckFg = true;
                // 사용 가능한 사용자ID 입니다.
                popup.alert(t('user.message.useAbleUserId'));
            }
        })
        .catch((e) => {
            return e;
        });
};

/** 재직구분 재직, 휴직으로 변경 시 퇴사일자 비우기 */
const changeEmployGbnFg = () => {
    if (user.value.employGbnFg != '30') {
        leaveDate.value = null;
        Object.assign(user.value, { leaveDate: null });
    }
};

// 사용자 유형 변경
const changeUserType = (userType: any) => {
    user.value.userTypeCd = userType;

    // 사용자 유형이 매입처 나 매출처 인 경우에 부서는 외주업체로 고정 및 disabled
    if (user.value.userTypeCd == '11' || user.value.userTypeCd == '12') {
        user.value.deptCd = '150';
        disableChangeDetail.disableDept = true;
    } else {
        disableChangeDetail.disableDept = false;
    }
};

// 사용자 유형 선택 팝업
const showUserTypeAlert = () => {
    // 사용자 유형을 선택해 주세요
    popup.alert(t('com.message.selectItemE', [t('com.label.userType')]));
};

// 날짜 변환 헬퍼 함수
const formatToDate = (dateStr?: string | null): Date | null => {
    if (!dateStr) {
        return null;
    }

    return new Date(dateStr.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
};

const loadUserDetail = async (userId: string) => {
    try {
        const res = await selectUser({
            userId,
            loginChainCd: TokenService.getUser().chainCd,
        });

        const data = res?.data?.result;
        if (!data) return;

        // 상태 업데이트
        updateCheckFg = 'U';
        idCheckFg = true;
        user.value = data;
        custParam.value.userTypeCd = data.userTypeCd ?? '';

        Object.assign(custParam.value, {
            custCd: data.custCd,
            custNm: data.custNm,
        });

        // 날짜 처리
        enterDate.value = formatToDate(data.enterDate);
        leaveDate.value = data.leaveDate ? formatToDate(data.leaveDate) : null;

        // 이메일 처리
        if (data.email?.includes('@')) {
            const [id = '', domain = ''] = data.email.split('@');

            emailId.value = id;
            selectedEmail.value = domain;
        }

        // 자동 등록 사용자 수정 제한 로직
        const custCd = data.custCd?.trim() ?? '';
        const uid = data.userId?.trim() ?? '';
        disableChangeDetail.disableFlag = custCd !== '' && uid !== '' && custCd === uid;

        // 사용자 유형에 따른 부서 고정
        if (data.userTypeCd === '11' || data.userTypeCd === '12') {
            user.value.deptCd = '150';
            disableChangeDetail.disableDept = true;
        }
    } catch (e: any) {
        popup.alert(e.message);
    }
};

// ==================================================
// Hook 영역
// ==================================================

watch(
    () => user.value.telNo,
    (newVal) => {
        user.value.telNo = utils.stringUtil.getFormatTelNo(newVal ?? '');
    },
);

watch(
    () => user.value.hpNo,
    (newVal) => {
        user.value.hpNo = utils.stringUtil.getFormatTelNo(newVal ?? '');
    },
);

watch(
    () => props.params,
    (params) => {
        if (!params) return;

        if (params.mode === 'new') {
            reset();
            return;
        }

        if (params.userId) {
            loadUserDetail(params.userId);
        }
    },
    {
        immediate: true,
        deep: true,
    },
);

onActivated(() => {
    // 초기 로드시
    selectMenuGroupUsing()
        .then((res) => {
            menuGroupList.value = res?.data?.result;
        })
        .catch((e) => {
            return e;
        });
});
</script>

<template>
    <!-- 메뉴&공통버튼영역 -->
    <!-- 초기화, 저장, 목록 -->
    <MenuTop ref="menuTopRef" :menu-info="$props.menuInfo" :methods="{ reset, save, pageMove }" />

    <MenuContent>
        <!-- S : Input Form -->

        <table class="tableLayout">
            <colgroup>
                <col style="width: 15%" />
                <col style="width: 35%" />
                <col style="width: 15%" />
                <col style="width: 35%" />
            </colgroup>
            <tbody>
                <tr>
                    <!-- * 사용자 ID -->
                    <th>* {{ t('com.label.userId') }}</th>
                    <td>
                        <div class="form_wrap" style="width: auto">
                            <ComInputbox
                                v-model="user.userId"
                                :maxlength="50"
                                :disabled="updateCheckFg == 'U'"
                                @input="changeId"
                            />
                            <!-- 중복확인 -->
                            <ComButton
                                :text="t('user.label.duplicateConfirm')"
                                @click="checkIdDuplication"
                            />
                        </div>
                    </td>
                    <!-- * 사용자명 -->
                    <th>* {{ t('com.label.userName') }}</th>
                    <td class="small">
                        <div class="form_wrap">
                            <ComInputbox v-model="user.userNm" />
                        </div>
                    </td>
                </tr>
                <tr v-if="updateCheckFg != 'U'">
                    <!-- * 비밀번호 -->
                    <th>* {{ t('com.label.password') }}</th>
                    <td class="small">
                        <div class="form_wrap">
                            <ComInputbox
                                v-model="user.passwd"
                                type="password"
                                autocomplete="new-password"
                            />
                        </div>
                    </td>
                    <!-- * 비밀번호 확인 -->
                    <th>* {{ t('user.label.passwordConfirm') }}</th>
                    <td class="small">
                        <div class="form_wrap">
                            <ComInputbox
                                v-model="passwdChk"
                                type="password"
                                autocomplete="new-password"
                                :disabled="updateCheckFg == 'U'"
                            />
                        </div>
                    </td>
                </tr>
                <tr>
                    <!-- 전화번호 -->
                    <th>{{ t('com.label.telNo') }}</th>
                    <td class="small">
                        <div class="form_wrap">
                            <ComInputbox v-model="user.telNo" :maxlength="13" />
                        </div>
                    </td>
                    <!-- 핸드폰번호 -->
                    <th>{{ t('com.label.hpNo') }}</th>
                    <td class="small">
                        <div class="form_wrap">
                            <ComInputbox v-model="user.hpNo" :maxlength="13" />
                        </div>
                    </td>
                </tr>
                <tr>
                    <!-- 주소 -->
                    <th>{{ t('com.label.address') }}</th>
                    <td colspan="3">
                        <AddressFind v-model="addressInfo" />
                    </td>
                </tr>
                <tr>
                    <!-- 이메일주소 -->
                    <th>{{ t('user.label.emailAddress') }}</th>
                    <td colspan="3">
                        <EmailAddress v-model="user.email" />
                    </td>
                </tr>
                <tr>
                    <!-- * 재직구분 -->
                    <th>* {{ t('user.label.employFlag') }}</th>
                    <td class="small">
                        <div class="form_wrap">
                            <ComSelectbox
                                v-model="user.employGbnFg"
                                :mode="'input'"
                                :options="EAT100"
                                @change="changeEmployGbnFg"
                            />
                        </div>
                    </td>
                    <!-- * 부서 -->
                    <th>* {{ t('com.label.dept') }}</th>
                    <td class="small">
                        <div class="form_wrap">
                            <ComSelectbox
                                v-model="user.deptCd"
                                :mode="'input'"
                                :select-type="'S'"
                                :options="EAT150"
                                :disabled="disableChangeDetail.disableDept"
                            />
                        </div>
                    </td>
                </tr>
                <tr>
                    <!-- * 사용자유형 -->
                    <th>* {{ t('com.label.userType') }}</th>
                    <td class="small">
                        <div class="form_wrap">
                            <ComSelectbox
                                v-model="custParam.userTypeCd"
                                :mode="'input'"
                                :select-type="'S'"
                                :options="EAT050"
                                @update:model-value="changeUserType"
                            />
                        </div>
                    </td>
                    <!-- * 거래처 -->
                    <th>* {{ t('com.label.cust') }}</th>
                    <td class="small">
                        <div class="form_wrap per100">
                            <!-- 사용자 유형 선택 안 되어 있을 경우 클릭 막기 -->
                            <div
                                v-if="!user.userTypeCd"
                                style="
                                    position: absolute;
                                    inset: 0;
                                    background: rgba(0, 0, 0, 0);
                                    z-index: 10;
                                "
                                @click="showUserTypeAlert"
                            ></div>

                            <CustCdAndNameSearch
                                ref="custCdInputRef"
                                v-model="custParam"
                                :disabled="disableChangeDetail.disableFlag"
                            />
                        </div>
                    </td>
                </tr>
                <tr>
                    <!-- * 메뉴그룹 -->
                    <th>* {{ t('menu.label.menuGroup') }}</th>
                    <td class="small">
                        <div class="form_wrap">
                            <ComSelectbox
                                v-model="user.menuGrpCd"
                                :mode="'input'"
                                :select-type="'S'"
                                :options="menuGroupList"
                                options-value-key="menuGrpCd"
                                options-label-key="menuGrpNm"
                                :disabled="disableChangeDetail.disableFlag"
                            />
                        </div>
                    </td>
                </tr>
                <tr>
                    <!-- * 입사일자 -->
                    <th>* {{ t('user.label.joinDate') }}</th>
                    <td>
                        <ComDateSelect
                            v-model="enterDate"
                            :mode="'input'"
                            :week-starts-on="0"
                            input-format="yyyy-MM-dd"
                            @update:model-value="(val) => console.log('부모에서 받은 값:', val)"
                        />
                    </td>
                    <!-- 퇴사일자 -->
                    <th>{{ t('user.label.leaveDate') }}</th>
                    <td>
                        <ComDateSelect
                            v-model="leaveDate"
                            :mode="'input'"
                            :week-starts-on="0"
                            input-format="yyyy-MM-dd"
                            :clearable="true"
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    </MenuContent>
</template>

<style scoped>
.datePickerClass {
    font-size: 16px;
}

.datePickerClass div div div * {
    text-align: center;
}

:deep(.cust-thin-code) {
    height: 32px;
    display: flex;
    align-items: center;
}

:deep(.cust-thin-code input) {
    height: 100%;
}

:deep(.cust-thin-code) .btn_input {
    height: 100%;
}
</style>
