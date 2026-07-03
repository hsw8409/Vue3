/*
 * @file     types/favorite.d.ts
 * @menu     즐겨찾기 타입 관련
 * @author   astems
 * @since    2026-06-26
 * @version  1.0
 */

export interface FavoriteProps {
    loginId?: string;
    userId?: string;
    pmenuCd?: string;

    mcd?: string;
    mnm?: string;
    mpath?: string;
}
