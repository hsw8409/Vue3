<script setup lang="ts">
/*
 * @file     MainLeft.vue
 * @menu     메인화면 - 좌측 (LNB 메뉴바)
 * @author   astems
 * @since    2026-06-22
 * @version  1.0
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import { ref, watch, inject, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useMenuStore } from '@/common/stores/menu';
import { useFavoriteStore } from '@/common/stores/favorite';

import type { MenuItemProps, SelectedMenuProps } from '@/types/menu';
// =====================================================================================================
// Type 선언 영역
// =====================================================================================================

interface LoginUser {
    userId?: string;
    chainCd?: string;
}

interface MenuTabParam {
    mcd: string;
}

// =====================================================================================================
// 변수 선언 영역
// =====================================================================================================
const loginUser = inject<LoginUser | null>('loginUser', null);

const emit = defineEmits<{
    (e: 'hide-menu-toggled', isLnbOn: boolean): void;
    (
        e: 'pageClick',
        menu: SelectedMenuProps & {
            params?: Record<string, unknown>;
        },
    ): void;
}>();

const menuStore = useMenuStore();
const favStore = useFavoriteStore();

const { items: favoriteList } = storeToRefs(favStore);

const isLnbOn = ref<boolean>(true);
const isFavOn = ref<boolean>(false);
const selectedMenu = ref<SelectedMenuProps | null>(null);

const searchQuery = ref<string>('');
const searchInput = ref<HTMLInputElement | null>(null);
const menuTree = ref<MenuItemProps[]>([]);

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
const buildTree = (list: MenuItemProps[] = [], parentId = 'ROOT'): MenuItemProps[] => {
    return list
        .filter((item) => item?.pcd === parentId)
        .map((item) => ({
            ...item,

            show: item.show ?? false,

            visiable: !(Number(item.lv) === 3 && item.useYn === 'N'),

            children: buildTree(list, item.mcd),
        }));
};

const closeMenuRecursive = (menu: MenuItemProps) => {
    menu.show = false;

    menu.children?.forEach(closeMenuRecursive);
};

const closeAllMenus = () => {
    menuTree.value.forEach(closeMenuRecursive);
};

const goPage = (mcd: string) => {
    const menu = menuStore.getSelectedMenu(mcd);

    if (!menu) return;

    selectedMenu.value = menu;

    emit('pageClick', {
        ...menu,
        params: {},
    });
};

const hideMenu = () => {
    isFavOn.value = false;

    isLnbOn.value = !isLnbOn.value;

    emit('hide-menu-toggled', isLnbOn.value);
};

const menuOnOff = () => {
    if (!isLnbOn.value) {
        isLnbOn.value = true;

        emit('hide-menu-toggled', true);
    }

    isFavOn.value = false;
};

const removeSearch = () => {
    searchQuery.value = '';

    searchInput.value?.focus();
};

const childHide = (b: boolean, i: number) => {
    const targetMenu = menuTree.value[i];

    if (!targetMenu) {
        return;
    }

    if (isLnbOn.value) {
        if (!b) {
            targetMenu.children?.forEach((item) => {
                if (item) {
                    item.show = false;
                }
            });
        }
    } else {
        if (b) {
            isLnbOn.value = true;

            emit('hide-menu-toggled', true);
        } else {
            targetMenu.children?.forEach((item) => {
                if (item) {
                    item.show = false;
                }
            });
        }
    }
};

// ==========================================
// 즐겨찾기 기능
// ==========================================

const favoriteToggle = async (flag: boolean) => {
    const mcd = selectedMenu.value?.mcd;

    if (!mcd || !loginUser?.userId) {
        return;
    }

    await favStore.toggleFavorite(loginUser.userId, mcd, flag);
};

const favoriteOnOff = () => {
    if (!isLnbOn.value) {
        isLnbOn.value = true;

        emit('hide-menu-toggled', true);
    }

    isFavOn.value = !isFavOn.value;
};

defineExpose({
    menuTabSet: (m: MenuTabParam) => {
        if (m?.mcd) {
            goPage(String(m.mcd));
        }
    },

    favoriteToggle,
});

// ==========================================
// 메뉴 검색 기능
// ==========================================
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
        '': '',
    };

    let result = '';

    for (const char of text) {
        result += combinedCharacterRanges[char] ?? char;
    }

    return result;
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

    try {
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
    } catch (e) {
        console.error('fuzzyMatcher error:', e);
        return false;
    }
};

const searchMenuInChildren = (menu: MenuItemProps, searchTerm: string): MenuItemProps[] => {
    if (!menu.children?.length) {
        return [];
    }

    return menu.children.reduce((result: MenuItemProps[], child) => {
        if (Number(child.lv) === 3 && fuzzyMatcher(searchTerm, child.mnm)) {
            result.push(child);
        }

        return result.concat(searchMenuInChildren(child, searchTerm));
    }, []);
};

const filteredMenu = computed(() => {
    const searchTerm = searchQuery.value.slice(0, 30).toLowerCase().trim();

    if (!searchTerm) {
        return [];
    }

    return menuTree.value.reduce((result, menu) => {
        return result.concat(searchMenuInChildren(menu, searchTerm));
    }, [] as MenuItemProps[]);
});

const filterFlag = computed(() => searchQuery.value.trim() !== '');

// =====================================================================================================
// Hook 영역
// =====================================================================================================

onMounted(async () => {
    console.info('여기 실행안됨?');
    if (!loginUser?.userId) {
        return;
    }

    await menuStore.fetchMenuList({
        loginChainCd: loginUser.chainCd ?? '',

        loginId: loginUser.userId,
    });

    await favStore.fetchFavoriteList(loginUser.userId);
});

watch(isFavOn, (nv) => {
    if (nv) {
        closeAllMenus();
    }
});

watch(isLnbOn, (nv) => {
    if (!nv) {
        closeAllMenus();
    }
});

watch(
    () => menuStore.menuList,
    (list) => {
        try {
            if (!Array.isArray(list)) {
                menuTree.value = [];
                return;
            }

            menuTree.value = buildTree(list);
        } catch (e) {
            console.error('menuTree build error:', e);
            menuTree.value = [];
        }
    },
    { immediate: true },
);
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
                        ref="searchInput"
                        v-model="searchQuery"
                        type="text"
                        placeholder="메뉴 검색"
                        autocomplete="off"
                        @keydown.esc="removeSearch"
                        @click="($event) => ($event.target as HTMLInputElement).select()"
                    />
                    <button type="button" class="btn-search" @click="searchQuery = ''">X</button>
                </div>
            </div>

            <div class="lnb_overflow no-print">
                <ul v-if="!isFavOn && !filterFlag" class="MenuTree">
                    <li
                        v-for="(d1, i1) in menuTree"
                        :key="d1.mcd"
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
                                v-for="d2 in d1.children"
                                :key="d2.mcd"
                                class="depth02"
                                :class="[d2.show ? 'open' : 'close']"
                            >
                                <button type="button" @click.stop.prevent="d2.show = !d2.show">
                                    <span>{{ d2.mnm }}</span>
                                </button>
                                <ul v-if="d2.children">
                                    <li v-for="d3 in d2.children" :key="d3.mcd" class="depth03">
                                        <a
                                            v-if="d3.visiable"
                                            :class="{ on: selectedMenu?.mcd === d3.mcd }"
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
                    <li v-for="d3 in favoriteList" :key="d3.mcd" class="depth03">
                        <a
                            :class="{ on: selectedMenu?.mcd === d3.mcd }"
                            @click.stop.prevent="goPage(`${d3.mcd}`)"
                        >
                            {{ d3.mnm }}
                        </a>
                    </li>
                </ul>

                <ul v-else-if="!isFavOn && filterFlag" class="MenuTree">
                    <li v-for="d3 in filteredMenu" :key="d3.mcd" class="depth03">
                        <a
                            :class="{ on: selectedMenu?.mcd === d3.mcd }"
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
