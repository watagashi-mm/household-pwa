/**
 * 収支区分マスタ
 */
export const BOP_MASTER = [
    { code: 1, name: "収入" },
    { code: 2, name: "支出" }
];

/**
 * カテゴリマスタ（収支区分ごと）
 */
export const CATEGORY_MASTER: Record<number, { code: number, name: string }[]> = {
    1: [ // 収入
        { code: 1, name: "給与" },
        { code: 2, name: "立替" },
        { code: 99, name: "その他" }
    ],
    2: [ // 支出
        { code: 1, name: "交通費" },
        { code: 2, name: "交際費" },
        { code: 3, name: "個人年金" },
        { code: 4, name: "医療費" },
        { code: 5, name: "奨学金返済" },
        { code: 6, name: "娯楽" },
        { code: 7, name: "携帯電話" },
        { code: 8, name: "日用品" },
        { code: 9, name: "生命保険" },
        { code: 10, name: "立替" },
        { code: 11, name: "食費" },
        { code: 12, name: "住居費" },
        { code: 13, name: "衣類" },
        { code: 14, name: "消耗品" },
        { code: 15, name: "積立NISA" },
        { code: 16, name: "ふるさと納税" },
        { code: 99, name: "その他" }
    ]
};

/**
 * 支払い方法マスタ（収支区分ごと）
 */
export const PAYMENT_MASTER: Record<number, { code: number, name: string }[]> = {
    1: [ // 収入
        { code: 1, name: "振込（みずほ）" }
    ],
    2: [ // 支出
        { code: 1, name: "現金" },
        { code: 2, name: "Suica" },
        { code: 3, name: "UC" },
        { code: 4, name: "引き落とし（みずほ）" },
        { code: 5, name: "デビッド（SBI）" },
        { code: 7, name: "Amazon" },
        { code: 8, name: "三井住友(CL)" }
    ]
};

/**
 * 取引データインターフェース
 */
export interface Transaction {
    id?: number;
    ymd: number;           // 年月日 (YYYYMMDD)
    bopCd: number;         // 収支区分コード (1:収入 2:支出)
    catCd: number;         // カテゴリコード
    memo: string;          // メモ
    pmtCd: number;         // 支払い方法コード
    amount: number;        // 金額
    accruedFlg: number;    // 未払いフラグ (0:通常 1:未払い)
}
