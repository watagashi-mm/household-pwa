export const BOP_MASTER = [
    { code: 1, name: "収入" },
    { code: 2, name: "支出" }
];

export const CATEGORY_MASTER: Record<number, { code: number, name: string }[]> = {
    1: [ // 収入
        { code: 1, name: "給与" },
        { code: 2, name: "その他収入" }
    ],
    2: [ // 支出
        { code: 1, name: "食費" },
        { code: 2, name: "交通費" },
        { code: 3, name: "日用品" }
    ]
};

export const PAYMENT_MASTER: Record<number, { code: number, name: string }[]> = {
    1: [ // 収入
        { code: 1, name: "振込" }
    ],
    2: [ // 支出
        { code: 1, name: "現金" },
        { code: 2, name: "クレジットカード" },
        { code: 3, name: "電子マネー" }
    ]
};

export interface Transaction {
    id?: number;
    ymd: number;           // YYYYMMDD
    bopCd: number;         // 1:収入 2:支出
    catCd: number;
    memo: string;
    pmtCd: number;
    amount: number;
    accruedFlg: number;    // 0 or 1
}
