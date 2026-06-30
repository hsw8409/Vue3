/**
 * @file     file.ts
 * @menu     파일 utils
 * @author   astems
 * @since    2026-06-30
 * @version  1.0
 *
 * @description

 */
// ==================================================
// import 영역
// ==================================================

import api from '@/common/axios/api';
import ExcelJS from 'exceljs';
import { utils } from '@/common/utils/';
import mitt from 'mitt';
import { saveAs } from 'file-saver';
import { AxiosResponse } from 'axios';
import instance from '@/common/axios/api';
import TokenService from '@/common/service/token';

// ==================================================
// 변수 선언 영역
// ==================================================
const emitter = mitt<{ errorMessageEvent: { type: string; msg: any } }>();

const uploadUrl = '/api/v1/sample/file/upload';
const downloadUrl = '/api/v1/file/download';

export const fileService = {
    // 파일 업로드
    async upload(files: any[], uploadPath: string): Promise<AxiosResponse | false> {
        if (utils.obj.isEmptyFile(files)) {
            console.error('업로드 파일이 존재하지 않습니다.');
            return false;
        }

        const formData = new FormData();
        let cnt = 0;

        files.forEach((obj) => {
            const file = obj.files?.[0];
            if (file) {
                formData.append('files', file);
                cnt++;
            }
        });

        if (cnt === 0) return false;

        formData.append('addPath', uploadPath);

        try {
            return await api.post(uploadUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        } catch (e: any) {
            emitter.emit('errorMessageEvent', { type: 'error', msg: e });
            return false;
        }
    },

    // 확장 파일 업로드
    async uploadExt(
        url: string,
        files: any,
        uploadPath: string,
    ): Promise<AxiosResponse | undefined> {
        const formData = new FormData();

        if (Array.isArray(files)) {
            files.forEach((obj) => {
                if (obj.files?.[0]) formData.append('files', obj.files[0]);
            });
        } else {
            formData.append('files', files);
        }

        formData.append('addPath', uploadPath);

        try {
            return await api.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        } catch (e) {
            console.error(e);
            alert(e);
        }
    },

    // 단순 다운로드
    async download(fileId: string, orgFileName?: string) {
        try {
            const response = await instance.get(downloadUrl, {
                params: { fileId },
                responseType: 'blob',
                headers: {
                    Authorization: `Bearer ${TokenService.getLocalAccessToken()}`,
                },
            });

            let fileName = orgFileName ?? 'download_file';

            saveAs(response.data, fileName);
        } catch (error) {
            console.error('다운로드 에러:', error);
        }
    },

    // 엑셀 파싱 (Promise 반환으로 수정)
    excelToJson(file: File): Promise<any[]> {
        return new Promise((resolve, reject) => {
            if (utils.obj.isEmptyFile(file)) {
                reject('업로드 파일이 존재하지 않습니다.');
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target?.result;
                if (!data) return reject('파일 읽기 실패');

                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(data as ArrayBuffer);

                // 1. 첫 번째 시트를 안전하게 가져옵니다.
                const sheet = workbook.worksheets[0];

                // 2. sheet이 존재하는지 확인하는 방어 코드를 추가합니다.
                if (!sheet) {
                    reject('엑셀 파일에 시트가 없습니다.');
                    return;
                }

                const headerRow = sheet.getRow(1);
                const result: any[] = [];

                sheet.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) return;
                    const rowValues: any = {};
                    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                        const columnKey = headerRow.getCell(colNumber).value?.toString();
                        if (!columnKey) return;

                        let val = cell.value;
                        if (val && typeof val === 'object' && 'result' in val) {
                            val = (val as any).result;
                        }
                        rowValues[columnKey] = val;
                    });
                    result.push(rowValues);
                });
                resolve(result);
            };

            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    },
};
