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
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        this.#isDarkMode = savedTheme === "dark" || (!savedTheme && prefersDark);
        this.#applyTheme();
    }

    #applyTheme() {
        if (this.#isDarkMode) {
            document.documentElement.classList.add("dark-mode");
        } else {
            document.documentElement.classList.remove("dark-mode");
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
