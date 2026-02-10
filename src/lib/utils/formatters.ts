import {
    BOP_MASTER,
    CATEGORY_MASTER,
    PAYMENT_MASTER
} from "../constants/masters";

/**
 * 取引日付(YYYYMMDD)を MM/DD 形式の文字列に変換します。
 */
export function formatDate(ymd: number): string {
    const s = ymd.toString();
    if (s.length !== 8) return s;
    return `${s.substring(4, 6)}/${s.substring(6, 8)}`;
}

/**
 * 数値をカンマ区切りの金額形式に変換します。
 */
export function formatAmount(amount: number): string {
    return `¥${amount.toLocaleString()}`;
}

/**
 * 収支区分名を取得します。
 */
export function getBopName(cd: number): string {
    return BOP_MASTER.find((m) => m.code === cd)?.name || "";
}

/**
 * カテゴリ名を取得します。
 */
export function getCatName(bopCd: number, catCd: number): string {
    return CATEGORY_MASTER[bopCd]?.find((m) => m.code === catCd)?.name || "";
}

/**
 * 支払い方法名を取得します。
 */
export function getPmtName(bopCd: number, pmtCd: number): string {
    return PAYMENT_MASTER[bopCd]?.find((m) => m.code === pmtCd)?.name || "";
}
