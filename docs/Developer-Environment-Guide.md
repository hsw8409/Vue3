# 개발 환경 구성 가이드

## 1. Node JS 설치

[Node JS Download Link](https://nodejs.org/ko/download)<br>
**OS에 맞게 다운로드후 설치**

- 설치후 확인<br>

```bash
$ node -v
v22.22.3

$ npm -v
10.9.8
```

## 2. Git Client 설치

[Git Client Download Link](https://git-scm.com/install/windows)<br>

**OS에 맞게 다운로드 후 설치**

- 설치후 확인<br>

```bash
$ git -v
git version 2.51.0.windows.1
```

## 3. IDE Setup

`IDE`는 `Visual Studio Code` 기준으로 구성<br>
개발자 필요에 따라 `Eclipse`를 사용해도 무방함

`Project Java Version`은 `11`이고 `IDE` 에서 설치시 `JDK11`로 설치해 주세요.

### 3.1. Visual Studio Code Install

`PC` 환경에 따라 `Download` 받아서 설치 →
[Visual Studio Code Download Link](https://code.visualstudio.com/download)

### 3.2. Plugins Install

- 현재 설치된 `Plugins` (자동 포함)
    1. `GitLens` 확장 프로그램
    2. `Git History` Git 히스토리 관리
    3. `ESLint`
    4. `Prettier`
    5. `Vue(Official)`
    6. `Vue 3 Snippets`

<br>

## 4. Source

### 4.1. Project open

이제부터 `Visual Studio Code`를 `IDE` 실행<br>
IDE > 파일 > 폴더 열기 > source 폴더( git clone한 폴더이다.)

### 4.2. Build

```bash
$ npm run build
```

### 5.2. Front-End Properties

#### 5.2.1 [vite.config.ts](../vite.config.ts)

#### 5.2.2 [package.json](../package.json)

# END
