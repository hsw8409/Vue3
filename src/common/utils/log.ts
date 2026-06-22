type LogFunction = (...args: any[]) => void;

// 프로젝트 환경 변수(Vite의 경우 import.meta.env)와 연동하면 더욱 좋습니다.
const LOG_DEBUG = true;
const LOG_INFO = true;
const LOG_ERROR = true;
const SYSTEM_DEBUG = true;

interface Log {
    debug: LogFunction;
    info: LogFunction;
    warn: LogFunction;
    error: LogFunction;
    system: LogFunction;
}

const log: Log = {
    debug: (...args: any[]) => {
        if (!LOG_DEBUG) return;
        console.log('[DEBUG]', ...args);
    },

    info: (...args: any[]) => {
        if (!LOG_INFO) return;
        console.info('[INFO]', ...args);
    },

    warn: (...args: any[]) => {
        if (!SYSTEM_DEBUG) return;
        console.warn('[WARN]', ...args);
    },

    error: (...args: any[]) => {
        if (!LOG_ERROR) return;
        console.error('[ERROR]', ...args);
    },

    system: (...args: any[]) => {
        if (!SYSTEM_DEBUG) return;
        console.log('%c[SYSTEM]', 'background: #222; color: #bada55; padding: 2px 5px;', ...args);
    },
};

export { log };
