/**
 * アプリケーション内で使用される表示テキストの定数定義
 */
export const TEXTS = {
    APP: {
        TITLE: "家計簿スマホ入力",
        TABS: {
            INPUT: "入力",
            LIST: "一覧",
            EXPORT: "出力"
        }
    },
    INPUT: {
        TITLE_ADD: "データ登録",
        TITLE_EDIT: "データ編集",
        FIELD_DATE: "日付",
        FIELD_BOP: "収支区分",
        FIELD_CATEGORY: "カテゴリ",
        FIELD_PAYMENT: "支払",
        FIELD_AMOUNT: "金額",
        FIELD_AMOUNT_PLACEHOLDER: "金額を入力",
        FIELD_MEMO: "メモ",
        FIELD_MEMO_PLACEHOLDER: "メモを入力",
        FIELD_ACCRUED: "未払い",
        BTN_SUBMIT: "登録",
        BTN_UPDATE: "更新",
        BTN_CANCEL: "キャンセル",
        ALERT_AMOUNT_REQUIRED: "金額を入力してください",
        SHORTCUT_LABEL: "よく使うカテゴリ"
    },
    LIST: {
        TITLE: "データ一覧",
        EMPTY_MESSAGE: "データがありません",
        BTN_EDIT: "編集",
        BTN_DELETE: "削除",
        CONFIRM_DELETE: "削除しますか？",
        ACCRUED_LABEL: "未払い"
    },
    EXPORT: {
        TITLE: "データ出力",
        EMPTY_MESSAGE: "出力するデータがありません",
        BTN_EXPORT: "CSV出力",
        BTN_CLEAR: "データ全削除",
        CONFIRM_CLEAR: "全てのデータを削除してもよろしいですか？",
        EXPORT_SUCCESS: "CSVを出力しました",
        CLEAR_SUCCESS: "全てのデータを削除しました"
    },
    COMMON: {
        SAVE_SUCCESS: "保存しました"
    }
};
