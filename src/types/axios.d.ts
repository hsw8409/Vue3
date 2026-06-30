export interface ApiResponse<T = any> {
    code?: number;
    status?: string;
    timestamp?: string;
    result?: T;
}
