<script setup lang="ts">
/*
 * @file     MainLeft.vue
 * @menu     메인화면 - 좌측 (LNB 메뉴바)
 * @author   astems
 * @since    2026-06-22
 * @version  1.0
 */

// ==================================================
// import 영역
// ==================================================
import { ref, watch, inject, onMounted } from 'vue';
import { selectMenu } from '@/api/main';
import { selectFavoriteMenu, addFavorite, deleteFavorite } from '@/api/favorite';
import { useFavoriteStore } from '@/common/stores/favorite';
import { storeToRefs } from 'pinia';
// ----------------------------------------------------------------------
// 1. 타입 정의 (Interfaces)
// ----------------------------------------------------------------------
interface MenuItem {
    mcd: string;
    pcd?: string | null;
    mnm: string;
    lv: number | string;
    mpath?: string;
    fileNm?: string;
    useYn?: string;
    visiable?: boolean;
    show?: boolean;
    children?: MenuItem[];
}

interface SelectedMenu {
    lname: string;
    mname: string;
    sname: string;
    path?: string;
    menuSclsCd: string;
    fileNm?: string;
}

interface LoginUser {
    userId?: string;
    chainCd?: string;
    [key: string]: any;
}

// ==================================================
// 변수 선언 영역
// ==================================================
const loginUser = inject<LoginUser | null>('loginUser', null);

const emit = defineEmits<{
    (e: 'hideMenuToggled', isLnbOn: boolean): void;
    (e: 'pageClick', selectedMenu: SelectedMenu): void;
    (e: 'menuListEmit', menuList: MenuItem[]): void;
}>();

const menuList = ref<MenuItem[]>([]);
const menuDepthList = ref<MenuItem[]>([]);
const isLnbOn = ref<boolean>(true);
const isFavOn = ref<boolean>(false);
const selectedMenu = ref<SelectedMenu | null>(null);
const searchQuery = ref<string>('');
const filteredMenu = ref<MenuItem[]>([]);
const filterFlag = ref<boolean>(false); // true: 검색 중 상태 / false: 기본 트리 상태
const favStore = useFavoriteStore();
const { items: favoriteList } = storeToRefs(favStore);

// ==================================================
// 사용자 정의 함수 영역
// ==================================================
const closeAllMenus = () => {
    menuDepthList.value.forEach((item) => {
        item.show = false;
        item.children?.forEach((v) => {
            v.show = false;
        });
    });
};

const buildTree = (
    queryResult: MenuItem[],
    outputList: MenuItem[],
    lv: number,
    parentId: string | null = null,
): MenuItem[] => {
    if (!queryResult || queryResult.length === 0) return outputList;

    const tempList = queryResult.filter((row) =>
        lv === 1 ? Number(row.lv) === lv : Number(row.lv) === lv && row.pcd === parentId,
    );

    if (tempList.length === 0) return outputList;

    for (const safeRow of tempList) {
        if (!safeRow) continue;

        if (!safeRow.children) safeRow.children = [];

        if (String(safeRow.lv) === '3' && safeRow.useYn === 'N') {
            safeRow.visiable = false;
        } else {
            safeRow.visiable = true;
        }
        safeRow.show = false;

        buildTree(queryResult, safeRow.children ?? [], lv + 1, safeRow.mcd);
        outputList.push(safeRow);
    }

    return outputList;
};

// 원본 메뉴 API 호출 및 트리 빌드
const optimizeFunction = async (): Promise<MenuItem[]> => {
    if (!loginUser?.userId) return [];

    const response = await selectMenu({
        loginChainCd: loginUser.chainCd,
        loginId: loginUser.userId,
    });

    const queryResult: MenuItem[] = response?.data?.result || [];
    if (!Array.isArray(queryResult)) return [];

    menuList.value = queryResult;
    const roots = buildTree(queryResult, [], 1);

    emit('menuListEmit', menuList.value);
    return roots;
};

// 즐겨찾기 메뉴 목록 조회
const createFavoriteMenu = async (): Promise<MenuItem[]> => {
    if (!loginUser?.userId) return [];

    const response = await selectFavoriteMenu({ loginId: loginUser.userId });
    const targetData = (response as any)?.result || response?.data?.result || response?.data || [];
    return targetData as MenuItem[];
};

const goPage = (mcd: string) => {
    const findItem = menuList.value.find((menu) => menu.mcd === mcd && Number(menu.lv) === 3);
    if (!findItem) return;
    const findmItem = menuList.value.find(
        (menu) => menu.mcd === findItem.pcd && Number(menu.lv) === 2,
    );
    if (!findmItem) return;
    const findlItem = menuList.value.find(
        (menu) => menu.mcd === findmItem.pcd && Number(menu.lv) === 1,
    );
    if (!findlItem) return;

    selectedMenu.value = {
        lname: findlItem.mnm,
        mname: findmItem.mnm,
        sname: findItem.mnm,
        path: findItem.mpath,
        menuSclsCd: findItem.mcd,
        fileNm: findItem.fileNm,
    };
    emit('pageClick', selectedMenu.value);
};

// 💡 부모 컴포넌트(mainPage.vue)에서 실질적으로 호출하는 메뉴 싱크/선택 함수 함수 구현
const menuTabSet = (m: any) => {
    if (!m) return;

    // mcd 속성이 있으면 사용하고, 없으면 menuSclsCd 속성을 targetMcd에 할당
    const targetMcd = m.mcd || m.menuSclsCd;

    if (targetMcd) {
        goPage(String(targetMcd));
    }
};

const hideMenu = () => {
    isFavOn.value = false;
    isLnbOn.value = !isLnbOn.value;
    emit('hideMenuToggled', isLnbOn.value);
};

const menuOnOff = () => {
    if (!isLnbOn.value) {
        isLnbOn.value = true;
        emit('hideMenuToggled', isLnbOn.value);
    }
    isFavOn.value = false;
};

const favoriteOnOff = () => {
    if (!isLnbOn.value) {
        isLnbOn.value = true;
        emit('hideMenuToggled', isLnbOn.value);
    }
    isFavOn.value = !isFavOn.value;
};

// 부모 컴포넌트 호출 유연성 확보 (오브젝트형 및 프리미티브 불리언 파라미터 전천후 대응)
const favoriteToggle = async (b: boolean | { flag: boolean }) => {
    const isFlagOn = typeof b === 'boolean' ? b : b?.flag;
    const menuCd = selectedMenu.value?.menuSclsCd;
    if (!menuCd || !loginUser?.userId) return;

    if (isFlagOn) {
        await addFavorite({
            loginId: loginUser.userId,
            menuSclsCd: menuCd,
            pmenuCd: menuCd,
        });
    } else {
        await deleteFavorite({
            loginId: loginUser.userId,
            menuSclsCd: menuCd,
            pmenuCd: menuCd,
        });
    }

    favoriteList.value = await createFavoriteMenu();
};

const childHide = (b: boolean, i: number) => {
    const targetMenu = menuDepthList.value[i];
    if (!targetMenu) return;

    if (isLnbOn.value) {
        if (!b) {
            targetMenu.children?.forEach((item) => {
                if (item) item.show = false;
            });
        }
    } else {
        if (b) {
            isLnbOn.value = true;
            emit('hideMenuToggled', isLnbOn.value);
        } else {
            targetMenu.children?.forEach((item) => {
                if (item) item.show = false;
            });
        }
    }
};

// 실시간 한글 타이핑 검색 시스템 함수
const searchMenu = () => {
    const searchTerm = searchQuery.value.toLowerCase().trim();
    if (searchTerm === '') {
        filteredMenu.value = [];
        return;
    }

    filteredMenu.value = menuDepthList.value.reduce((result: MenuItem[], menu) => {
        return result.concat(searchMenuInChildren(menu, searchTerm));
    }, []);
};

const searchMenuInChildren = (menu: MenuItem, searchTerm: string): MenuItem[] => {
    if (!menu.children || menu.children.length === 0) return [];

    return menu.children.reduce((result: MenuItem[], child) => {
        if (Number(child.lv) === 3 && fuzzyMatcher(searchTerm, child.mnm)) {
            result.push(child);
        }
        result = result.concat(searchMenuInChildren(child, searchTerm));
        return result;
    }, []);
};

// 초성 및 콤비네이션 퍼지 매칭 엔진
const fuzzyMatcher = (query: string, target: string): boolean => {
    const initialConsonantRanges: Record<string, [string, string]> = {
        ㄱ: ['가', '깋'],
        ㄲ: ['까', '낗'],
        ㄴ: ['나', '닣'],
        ㄷ: ['다', '딯'],
        ㄸ: ['따', '띻'],
        ㄹ: ['라', '맇'],
        ㅁ: ['마', '밓'],
        ㅂ: ['바', '삫'],
        ㅃ: ['빠', '쯩'],
        ㅅ: ['사', '싷'],
        ㅆ: ['싸', '앃'],
        ㅇ: ['아', '잏'],
        ㅈ: ['자', '짛'],
        ㅉ: ['짜', '찧'],
        ㅊ: ['차', '칳'],
        ㅋ: ['카', '킿'],
        ㅌ: ['타', '팋'],
        ㅍ: ['파', '핗'],
        ㅎ: ['하', '힣'],
    };

    const pattern = expandCombinedCharacters(query)
        .split('')
        .map((char) => {
            if (/[ㄱ-ㅎ]/.test(char) && initialConsonantRanges[char]) {
                const [start, end] = initialConsonantRanges[char];
                return `[${char}${start}-${end}]`;
            } else {
                return escapeRegExp(char);
            }
        })
        .join('.*');

    return new RegExp(pattern, 'i').test(target);
};

const escapeRegExp = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const expandCombinedCharacters = (text: string): string => {
    const combinedCharacterRanges: Record<string, string> = {
        ㄳ: 'ㄱㅅ',
        ㄵ: 'ㄴㅈ',
        ㄶ: 'ㄴㅎ',
        ㄺ: 'ㄹㄱ',
        ㄻ: 'ㄹㅁ',
        ㄼ: 'ㄹㅂ',
        ㄽ: 'ㄹㅅ',
        ㄾ: 'ㄹㅌ',
        ㄿ: 'ㄹㅍ',
        ㅀ: 'ㄹㅎ',
        ㅄ: 'ㅂㅅ',
        ' ': '',
    };

    let expandedText = '';
    for (const char of text) {
        if (combinedCharacterRanges[char]) {
            expandedText += combinedCharacterRanges[char];
        } else {
            expandedText += char;
        }
    }
    return expandedText;
};

const removeSearch = () => {
    searchQuery.value = '';
    document.getElementById('searchQuery')?.focus();
};

// ==================================================
// Hook 및 Watcher 영역
// ==================================================
watch(isFavOn, (nv) => {
    if (nv) closeAllMenus();
});

watch(isLnbOn, (nv) => {
    if (!nv) closeAllMenus();
});

watch(searchQuery, (nv) => {
    filterFlag.value = nv !== '';
});

// 3. onMounted 수정
onMounted(async () => {
    if (loginUser?.userId) {
        // 메뉴 리스트 로드
        menuDepthList.value = await optimizeFunction();

        // 즐겨찾기 로드
        await favStore.fetchFavoriteList(loginUser.userId);
    }
});

// 🔥 부모 컴포넌트가 온전히 탐색할 수 있도록 필수 트리거 등록 완료!
defineExpose({
    menuTabSet,
    favoriteToggle,
});
</script>

<template>
    <div class="lnbW no-print" :class="{ on: isLnbOn, off: !isLnbOn }">
        <div id="lnb" class="no-print">
            <div class="util np-print">
                <button
                    type="button"
                    class="menu"
                    :class="{ on: !isFavOn, off: isFavOn }"
                    @click.stop.prevent="menuOnOff"
                >
                    <span>MENU</span>
                </button>
                <button
                    type="button"
                    class="favorite"
                    :class="{ on: isFavOn, off: !isFavOn }"
                    @click.stop.prevent="favoriteOnOff"
                >
                    <span>FAVORITE</span>
                </button>
                <button
                    type="button"
                    :class="{ ShowMenu: !isLnbOn, HideMenu: isLnbOn }"
                    @click.stop.prevent="hideMenu"
                >
                    <span class="a11y">메뉴숨기기</span>
                </button>
            </div>

            <div v-if="!isFavOn && isLnbOn" class="lnb-search-area">
                <div class="search-box">
                    <input
                        id="searchQuery"
                        v-model="searchQuery"
                        type="text"
                        placeholder="메뉴 검색"
                        autocomplete="off"
                        @input="searchMenu"
                        @keydown.esc="removeSearch"
                        @click="($event) => ($event.target as HTMLInputElement).select()"
                    />
                    <button type="button" class="btn-search" @click="searchQuery = ''">X</button>
                </div>
            </div>

            <div class="lnb_overflow no-print">
                <ul v-if="!isFavOn && !filterFlag" class="MenuTree">
                    <li
                        v-for="(d1, i1) in menuDepthList"
                        :key="i1"
                        class="depth01"
                        :class="[d1.show ? 'open' : 'close']"
                    >
                        <button
                            type="button"
                            @click.stop.prevent="[(d1.show = !d1.show), childHide(d1.show, i1)]"
                        >
                            <span>{{ d1.mnm }}</span>
                        </button>
                        <ul v-if="d1.children">
                            <li
                                v-for="(d2, i2) in d1.children"
                                :key="i2"
                                class="depth02"
                                :class="[d2.show ? 'open' : 'close']"
                            >
                                <button type="button" @click.stop.prevent="d2.show = !d2.show">
                                    <span>{{ d2.mnm }}</span>
                                </button>
                                <ul v-if="d2.children">
                                    <li v-for="(d3, i3) in d2.children" :key="i3" class="depth03">
                                        <a
                                            v-if="d3.visiable"
                                            :class="{ on: selectedMenu?.menuSclsCd === d3.mcd }"
                                            @click.stop.prevent="goPage(`${d3.mcd}`)"
                                        >
                                            {{ d3.mnm }}
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>

                <ul v-else-if="isFavOn" class="MenuTree">
                    <li v-for="(d3, i3) in favoriteList" :key="i3" class="depth03">
                        <a
                            :class="{ on: selectedMenu?.menuSclsCd === d3.mcd }"
                            @click.stop.prevent="goPage(`${d3.mcd}`)"
                        >
                            {{ d3.mnm }}
                        </a>
                    </li>
                </ul>

                <ul v-else-if="!isFavOn && filterFlag" class="MenuTree">
                    <li v-for="(d3, i3) in filteredMenu" :key="i3" class="depth03">
                        <a
                            :class="{ on: selectedMenu?.menuSclsCd === d3.mcd }"
                            @click.stop.prevent="goPage(`${d3.mcd}`)"
                        >
                            {{ d3.mnm }}
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style scoped>
a {
    cursor: pointer;
}
.removeSearch {
    position: absolute;
    left: 69%;
    top: 7%;
    cursor: pointer;
}
.SearchMenu {
    padding: 8px 12px;
    background: #fff;
    border-bottom: 1px solid #ddd;
}
.SearchMenu input {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
.lnb-search-area {
    padding: 6px 8px;
    background-color: #282828;
    height: 40px;
}
.search-box {
    display: flex;
    align-items: center;
    background-color: #282828;
    border: 1px solid #8f8f8f;
    border-radius: 4px;
    overflow: hidden;
}
.search-box input {
    flex: 1;
    padding: 5px 8px;
    font-size: 15px;
    border: none;
    outline: none;
    background-color: transparent;
    color: #fff;
}
.search-box .btn-search {
    padding: 0 8px;
    background: none;
    border: none;
    color: #ccc;
    cursor: pointer;
    font-size: 14px;
    user-select: none;
}
.search-box .btn-search:hover {
    color: #fff;
}
.lnb_overflow::-webkit-scrollbar {
    width: 15px;
}
.lnb_overflow::-webkit-scrollbar-track {
    background: #282828;
}
.lnb_overflow::-webkit-scrollbar-thumb {
    background-color: #5f6b6bcd;
    border-radius: 10px;
    border: 2px solid #282828;
}
.lnb_overflow::-webkit-scrollbar-thumb:hover {
    background-color: #5d6969ff;
}
</style>
