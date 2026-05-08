export interface PageChangePayload {
    request: number | string;
    page: number;
    currentPage: number;
    totalPages: number;
    handled: boolean;
    priority: number;
    source?: string;
}