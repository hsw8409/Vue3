import api from '@/common/axios/api';
import ExcelJS from 'exceljs';
import { utils } from '@/common/utils/';
import mitts from 'mitt';
import { saveAs } from 'file-saver';

const uploadUrl = '/api/v1/sample/file/upload';
const downloadUrl = '/api/v1/file/download';
const file = {};
const mitt = mitts();
//파일 업로드 sample
file.upload = async (files, uploadPath) => {
  if (utils.obj.isEmptyFile(files)) {
    console.error('업로드 파일이 존재 하지 않습니다.');
    return false;
  }

  const formData = new FormData();
  let cnt = 0;
  files.forEach((obj, idx) => {
    const file = obj.files[0];
    if (file) {
      if (file.length == 0) return true;
      formData.append('files', file);
      cnt = cnt + 1;
    }
  });

  if (cnt == 0) {
    console.error('업로드 파일이 존재 하지 않습니다.');
    return false;
  }
  formData.append('addPath', uploadPath);
  const res = await api
    .post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Origin': '*',
      },
    })
    .then((res) => {
      console.log(res);
      if (null != res && res.response) {
        console.error('업로드 완료');
      }
      return res;
    })
    .catch(function (e) {
      console.log(e);
      mitt.emit('errorMessageEvent', { type: 'error', msg: e });
    });

  return res;
};

//파일 업로드 업로드 URL을 받아서 처리
file.uploadExt = async (url, files, uploadPath) => {
  if (utils.obj.isEmptyFile(files)) {
    console.error('업로드 파일이 존재 하지 않습니다.');
    return false;
  }

  const formData = new FormData();
  try {
    files.forEach((obj, idx) => {
      const file = obj.files[0];
      if (file) {
        if (file.length == 0) return true;
        formData.append('files', file);
      }
    });
  } catch (e) {
    //멀티 파일이 아니라 단일 파일인 경우
    formData.append('files', files);
  }

  if (!formData || formData.length == 0) {
    console.error('업로드 파일이 존재 하지 않습니다.');
    return false;
  }
  formData.append('addPath', uploadPath);
  const res = await api
    .post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Origin': '*',
      },
    })
    .then((res) => {
      return res;
    })
    .catch(function (e) {
      console.log(e);
      alert(e);
    });

  return res;
};

// downalod
file.download = (params) => {
  console.log('[Download]', params);
  const downloadUrl =
    '/api/v1/file/download?originalFileName=' +
    params.originalFileName +
    '&downPath=' +
    params.downloadPath;
  console.log(downloadUrl);
  try {
    saveAs(downloadUrl, params.originalFileName);
  } catch (e) {
    console.log(e);
    alert(e);
  }
};

file.download2 = (params) => {
  console.log('[Download]', params);
  api
    .get(downloadUrl, { params }, { responseType: 'blob' })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      //console.log(params);
      //console.log(params.originalFileName);
      link.setAttribute('download', params.originalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch((exception) => {
      alert('File download fail!');
      console.error('파일 다운로드 실패');
    });
};

// excel parser
// excel parser (exceljs 버전)
file.excelToJson = async (file, callback) => {
  if (utils.obj.isEmptyFile(file)) {
    console.error('업로드 파일이 존재 하지 않습니다.');
    return false;
  }

  const reader = new FileReader();

  // exceljs는 비동기로 동작하므로 onload 이벤트를 async 함수로 선언합니다.
  reader.onload = async (e) => {
    const data = reader.result;
    const workbook = new ExcelJS.Workbook();

    // ArrayBuffer 데이터를 메모리 엔진에 탑재합니다.
    await workbook.xlsx.load(data);

    let finalResult = [];

    // 엑셀 내의 모든 시트(Sheet)를 순회하며 데이터를 추출합니다.
    workbook.eachSheet((sheet) => {
      const sheetData = [];
      const headerRow = sheet.getRow(1); // 첫 번째 행을 컬럼명(Key)으로 지정

      sheet.eachRow((row, rowNumber) => {
        // 1번째 줄(제목 행)은 데이터 목록 파싱에서 제외합니다.
        if (rowNumber === 1) return;

        const rowValues = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const columnKey = headerRow.getCell(colNumber).value;
          if (!columnKey) return; // 컬럼명이 없는 빈 열은 패스

          // 수식이나 특수 객체가 들어있을 경우 최종 결과 값(result)을 안전하게 추출합니다.
          let cellValue = cell.value;
          if (cellValue && typeof cellValue === 'object') {
            cellValue = cellValue.result !== undefined ? cellValue.result : cellValue.text;
          }

          rowValues[columnKey] = cellValue;
        });

        sheetData.push(rowValues);
      });

      // 기존 xlsx 코드의 로직처럼 마지막 시트의 데이터 배열이 최종 결과로 매핑됩니다.
      finalResult = sheetData;
    });

    // 가공이 끝난 JSON 데이터를 콜백 함수로 안전하게 반환합니다.
    callback(finalResult);
  };

  // 💡 중요: 기존 readAsBinaryString 대신 파일 버퍼를 직접 읽어 들이는 함수로 변경합니다.
  reader.readAsArrayBuffer(file);
  return true;
};

export { file };
