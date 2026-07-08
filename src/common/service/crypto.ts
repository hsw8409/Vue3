/**
 * @file     /common/service/crypto.ts
 * @menu     암/복호화 모듈
 * @author   astems
 * @since    2026-06-17
 * @version  1.0
 *
 * @description
 * AES-CBC-PKCS7 양방향 암호화/복호화 유틸리티
 */

// =====================================================================================================
// import 영역
// =====================================================================================================
import CryptoJS from 'crypto-js';

// =====================================================================================================
// 변수 선언
// =====================================================================================================
const KEY_STR = 'astems2468_secureKey32BytesLong!'; // 32자리 (AES-256용)
const IV_STR = 'livestockPackage'; // 16자리

// Utf8 파싱은 매번 할 필요 없으므로 모듈 로드 시 최초 1회만 실행
const key = CryptoJS.enc.Utf8.parse(KEY_STR);
const iv = CryptoJS.enc.Utf8.parse(IV_STR);

// =====================================================================================================
// 사용자 정의 함수 영역
// =====================================================================================================
const cryptoUtil = {
    /**
     * AES CBC PKCS7 방식으로 문자열 암호화
     * @param plainText 암호화할 평문 문자열
     * @returns Base64 인코딩된 암호문 string
     */
    encrypt(plainText: string): string {
        if (!plainText) return '';

        const encrypted = CryptoJS.AES.encrypt(plainText, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        return encrypted.toString();
    },

    /**
     * AES CBC PKCS7 방식으로 암호문 복호화
     * @param cipherText Base64 인코딩된 암호문
     * @returns 복호화된 평문 string
     */
    decrypt(cipherText: string): string {
        if (!cipherText) return '';

        const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    },
};

export default cryptoUtil;
