/**
 * @file     log.ts
 * @menu     log util
 * @author   astems
 * @since    2026-06-30
 * @version  1.0
 *
 * @description

 */
// =====================================================================================================
// import 영역
// =====================================================================================================
type LogFunction = (...args: unknown[]) => void;

// =====================================================================================================
// 변수 선언
// =====================================================================================================
const LOG_DEBUG = true;
const LOG_INFO = true;
const LOG_WARN = true;
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
    debug: (...args: unknown[]) => {
        if (!LOG_DEBUG) return;
        console.log('[DEBUG]', ...args);
    },

    info: (...args: unknown[]) => {
        if (!LOG_INFO) return;
        console.info('[INFO]', ...args);
    },

    warn: (...args: unknown[]) => {
        if (!LOG_WARN) return;
        console.warn('[WARN]', ...args);
    },

    error: (...args: unknown[]) => {
        if (!LOG_ERROR) return;
        console.error('[ERROR]', ...args);
    },

    system: (...args: unknown[]) => {
        if (!SYSTEM_DEBUG) return;
        console.log('%c[SYSTEM]', 'background: #222; color: #bada55; padding: 2px 5px;', ...args);
    },
};

export { log };
