/**
 * アプリケーションのグローバル設定を管理するサービス
 * Svelte 5 の Runes を使用してリアクティブに状態を保持します。
 */

class AppSettings {
    #isDarkMode = $state(false);

    constructor() {
        this.#loadSettings();
    }

    get isDarkMode() {
        return this.#isDarkMode;
    }

    set isDarkMode(value: boolean) {
        this.#isDarkMode = value;
        localStorage.setItem("theme", value ? "dark" : "light");
        this.#applyTheme();
    }

    #loadSettings() {
        const query = window.matchMedia("(prefers-color-scheme: dark)");

        // 保存された設定があるか確認
        const savedTheme = localStorage.getItem("theme");

        if (savedTheme) {
            this.#isDarkMode = savedTheme === "dark";
        } else {
            // 初期値はシステム設定
            this.#isDarkMode = query.matches;

            // システム設定の変更を監視（手動設定がない場合のみ反映）
            query.addEventListener("change", (e) => {
                if (!localStorage.getItem("theme")) {
                    this.#isDarkMode = e.matches;
                    this.#applyTheme();
                }
            });
        }

        this.#applyTheme();
    }

    #applyTheme() {
        if (this.#isDarkMode) {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
        } else {
            document.documentElement.classList.remove("dark");
            document.documentElement.classList.add("light");
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.#isDarkMode;
    }

    /**
     * 特定のキーで localStorage から値を取得（数値型用）
     */
    getLastValue(key: string, defaultValue: number): number {
        const val = localStorage.getItem(key);
        return val ? parseInt(val) : defaultValue;
    }

    /**
     * 特定のキーで localStorage に値を保存
     */
    setLastValue(key: string, value: any) {
        localStorage.setItem(key, value.toString());
    }
}

export const settings = new AppSettings();
