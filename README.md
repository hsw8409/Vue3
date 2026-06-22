# 🚀 Vue3 + TypeScript 기반

> 최신 웹 기술을 활용해 더 빠르고 안정적으로 움직이는 시스템을 구축하는 프로젝트입니다.

---

## 📝 프로젝트 소개

우리 프로젝트는 사용자가 서비스를 이용할 때 버벅임 없이 쾌적한 화면을 누릴 수 있도록, 그리고 추후 새로운 기능을 추가할 때도 막힘없이 튼튼하게 확장할 수 있도록 설계되었습니다. 최신 시장 표준 기술들을 조화롭게 연결하여 시스템의 완성도를 높였습니다.

## 🛠 어떤 기술들이 사용되었나요?

- **화면 구성 (Vue 3):** 웹사이트의 화면을 레고 블록처럼 조각조각 나누어 개발하는 기술입니다. 자주 쓰는 버튼이나 입력창을 미리 만들어두고 조립하듯 쓰기 때문에 개발 속도가 빨라집니다.
- **스마트한 검사기 (TypeScript):** 코드를 작성하는 도중 오타나 잘못된 데이터가 들어가면 실시간으로 경고를 띄워주는 안전장치입니다. 시스템이 갑자기 멈추거나 에러가 나는 배포 사고를 미리 방지해 줍니다.
- **공통 기억 장치 (Pinia):** 로그인한 유저의 정보나 화면 간에 공유해야 하는 중요한 데이터들을 한곳에 모아 똑똑하게 기억하고 배달해 주는 창고 역할을 합니다.
- **초고속 엔진 (Vite):** 수정된 화면을 0.1초 만에 모니터에 바로 띄워주고, 전체 시스템을 가볍고 빠르게 압축해 주는 최신형 개발 엔진입니다.
- **코드 정리 (ESLint & Prettier):** 코드가 지저분하게 작성되더라도 저장 버튼만 누르면 줄바꿈과 글자 모양을 자석처럼 알아서 깔끔하게 정돈해 주는 자동 청소 도구입니다.

## ✨ 프로젝트의 장점

1. **에러 최소화:** 꼼꼼한 안전장치 덕분에 서비스가 중간에 멈추는 버그가 거의 없습니다.
2. **유지보수 용이:** 코드가 규격화되어 있어, 나중에 새로운 개발자가 참여해도 바로 적응하고 수정할 수 있습니다.
3. **빠른 속도:** 최신 엔진을 사용하여 화면이 뜨고 움직이는 속도가 매우 쾌적합니다.

## 📁 프로젝트 전체 구조 (Project Directory Structure)

본 프로젝트는 **Vite** 빌드 시스템을 중심으로 구성되어 있으며, 소스 코드는 관심사 분리(Separation of Concerns) 원칙에 따라 계층화되어 관리됩니다.

```text
├── public/                     # 정적 자원 디렉터리 (빌드 시 변형 없이 그대로 배포, e.g., favicon)
├── src/                        # 애플리케이션 실제 소스 코드 공간
│   ├── api/                    # 🌐 백엔드 API 서비스 호출 관리 (API 모듈화 계층)
│   ├── assets/                 # 전역 스타일시트(기본 CSS) 및 브랜드 로고 이미지 등 관리
│   ├── common/                 # 공통 핵심 서비스 계층 [ API 통신(axios), 전역 상태(store), 유틸리티(utils) ]
│   ├── components/             # 페이지를 구성하는 재사용성 UI 컴포넌트 [ login, Main, Layout 등 ]
│   ├── i18n/                   # 다국어 메시지 관리
│   ├── routers/                # Vue Router 설정 및 라우팅 내비게이션 가드 관리
│   ├── static/                 # 외부 라이브러리, 모듈, 레거시 CSS/JS/IMG 자원 보관소
│   ├── types/                  # 🏷️ TypeScript 타입 정의 관리 (.d.ts 및 전역 Type/Interface)
│   ├── views/                  # 라우터와 매핑되는 도메인별 화면 개발 파일들의 위치
│   └── App.vue                 # 애플리케이션 최상위 루트 뷰 컴포넌트
│   ├── env.d.ts                # 📝 Vite 환경 변수 및 클라이언트 내장 타입 선언 파일
│   ├── main.ts                 # ⚡ 애플리케이션 메인 로직 엔트리 (진입점 및 인스턴스 마운트)
│   ├── shims-vue.d.ts          # 🧩 TypeScript가 .vue 파일을 인식하도록 돕는 모듈 선언 파일
├── .env.development            # 개발 환경(Development Mode) 전역 변수 설정 파일
├── .prettierrc                 # Prettier 코드 스타일 포맷터(자동 정렬) 규칙 설정 파일
├── eslint.config.js            # ESLint 정적 분석 및 코드 린팅 규칙 설정 파일
├── index.html                  # 애플리케이션의 시작점이 되는 Single Page Application(SPA) HTML 파일
├── package.json                # Node.js 패키지 의존성(Dependencies) 및 스크립트 정의 파일
├── tsconfig.json               # TypeScript 컴파일러 옵션 및 내부 플러그인(Vue 언어 분석 등) 설정 파일
└── vite.config.js              # Vite 번들러 플러그인, 빌드 타깃, 경로 별칭(Alias) 설정 파일
```

## 🚀 시작 가이드 (Getting Started)

본 프로젝트를 로컬 환경에서 실행하고 빌드하기 위한 가이드입니다.

### 📦 사전 준비 사항 (Prerequisites)

프로젝트 구동을 위해 PC에 아래 프로그램들이 설치되어 있어야 합니다.

- **Node.js:** v18.x 이상 권장 (LTS 버전)
- **Package Manager:** npm (Node.js 설치 시 자동 설치) 또는 pnpm / yarn

### 🛠️ 설치 및 로컬 서버 구동 (Installation & Execution)

1. **저장소 복제 (Clone the repository)**

    ```bash
    git clone [레포지토리 주소]
    cd [프로젝트 폴더명]
    ```

2. **의존성 패키지 설치 (Install dependencies)**

    ```bash
    npm install
    ```

    > 💡 **참고:** `package.json`에 명시된 오픈소스 라이브러리와 TypeScript 관련 패키지들을 로컬 환경에 다운로드합니다. 설치가 완료되면 루트에 `node_modules/` 폴더가 생성됩니다.

3. **개발 서버 실행 (Run development server)**

    ```bash
    npm run dev
    ```

    > 🚀 **실행 결과:** Vite 엔진 기반의 초고속 HMR 개발 서버가 구동됩니다. 터미널 창에 출력되는 로컬 웹 주소(e.g., `http://localhost:5173/`)를 브라우저에 입력하여 화면 개발 파일(`.vue`)의 실시간 반영 상태를 확인하며 작업할 수 있습니다.

## 🔌 필수 확장 프로그램 (Recommended Extensions)

본 프로젝트는 TypeScript, ESLint, Prettier 설정 파일(`tsconfig.json`, `.eslintrc.cjs`, `.prettierrc`)이 저장소(Git)에 이미 포함되어 있습니다.

아래의 **VS Code 확장 프로그램들을 설치하시면, 로컬에 저장된 설정 파일들을 에디터가 자동으로 인식**하여 일관된 개발 환경과 코드 포맷팅을 제공합니다. 프로젝트 시작 전 반드시 설치해 주시기 바랍니다.

## 🔌 권장 확장 프로그램 (Recommended Extensions)

본 프로젝트는 저장소(Git)에 프로젝트 표준 설정 파일(`tsconfig.json`, `.eslintrc.cjs`, `.prettierrc`)이 이미 포함되어 있습니다.

VS Code에서 아래 확장 프로그램들을 설치하시면, 로컬 설정들을 에디터가 자동으로 흡수하여 코드 분석, 자동 정렬, 개발 속도 향상 등의 강력한 보조 기능을 제공합니다.

### 🌟 1. 필수 설치 항목 (Core Tools)

#### 🔹 Vue Official

- **중요도:** 🔥🔥🔥 (필수)
- **역할:** Vue 3 프로젝트 개발을 위한 공식 표준 확장 프로그램입니다. (구 명칭: Volar)
- **특징:** `.vue` 파일의 문법 강조는 물론, 파일 내부의 TypeScript 코드를 꼼꼼하게 검사하고 자동 완성을 수행합니다.
- **⚠️ 주의사항:** 과거 Vue 2 시절에 쓰던 `Vetur` 확장 프로그램이 설치되어 있다면 반드시 비활성화(Disable)해야 충돌이 나지 않습니다.

#### 🔹 ESLint

- **중요도:** 🔥🔥🔥 (필수)
- **역할:** 저장소의 `eslint.config.js` 규칙을 실시간으로 읽어와 코드의 문법 오류 및 팀 내 코딩 규칙 위반 사항을 감지하여 에러 줄을 그어줍니다 (정적 코드 분석).

#### 🔹 Prettier - Code formatter

- **중요도:** 🔥🔥🔥 (필수)
- **역할:** 저장소의 `.prettierrc` 설정에 맞춰 코드 스타일(들여쓰기, 따옴표, 세미콜론 등)을 강제로 정렬해 주어, 팀원 간의 코딩 스타일을 완벽하게 통일합니다.

---

### 🚀 2. 개발 생산성 향상 항목 (Productivity Tools)

#### 🔹 Vue 3 Snippets

- **중요도:** ⚡⚡ (권장)
- **역할:** Vue 3 코드 자동완성 조각(Snippets)들을 제공합니다.
- **특징:** 매번 길게 타이핑해야 하는 Vue 3의 구조 코드(예: `vbase`, `vfor` 등)를 단축어 몇 글자만으로 순식간에 생성해 주어 타자 속도와 개발 효율을 획기적으로 높여줍니다.

#### 🔹 GitLens — Git supercharged

- **중요도:** ⚡⚡ (권장)
- **역할:** 강력한 Git 시각화 및 코드 분석 도구입니다.
- **특징:** 특정 코드 라인에 마우스를 대거나 클릭하면 **"이 코드는 누가, 언제, 어떤 커밋 메시지와 함께 수정했는지"**를 편집기 창에 흐리게 보여줍니다. 협업 시 과거 히스토리를 추적하고 버그의 원인을 찾을 때 엄청난 도움이 됩니다.

---

### 💡 [설정 공유] 파일 저장 시 자동 교정 세팅

설치한 Prettier와 ESLint가 파일을 저장하는 순간 자동으로 코드를 교정해 주도록, VS Code 설정을 아래와 같이 세팅하는 것을 강력히 권장합니다. (`Ctrl + ,` 입력 후 `json` 검색 -> `settings.json`에 추가)

```json
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "always"
    }
}
```
