<script lang="ts">
  import { onMount } from "svelte";
  import Input from "./lib/components/Input.svelte";
  import List from "./lib/components/List.svelte";
  import Export from "./lib/components/Export.svelte";
  import type { Transaction } from "./lib/constants/masters";
  import { TEXTS } from "./lib/constants/texts";

  let currentTab = "input";
  let editingTransaction: Transaction | null = null;
  let listComponent: List;
  let toastMessage = "";
  let toastVisible = false;

  const tabs = ["input", "list", "export"];

  // ダークモード管理
  let isDarkMode = false;

  onMount(() => {
    // 保存されたテーマまたはシステム設定を読み込み
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      isDarkMode = true;
      document.documentElement.classList.add("dark");
    } else {
      isDarkMode = false;
      document.documentElement.classList.remove("dark");
    }
  });

  /**
   * テーマの切り替え
   */
  function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }

  /**
   * トーストメッセージを表示
   * @param {string} message
   */
  function showToast(message: string) {
    toastMessage = message;
    toastVisible = true;
    setTimeout(() => {
      toastVisible = false;
    }, 2000);
  }

  /**
   * 編集対象の取引データをセットし、入力タブへ切り替え
   * @param {CustomEvent<Transaction>} event
   */
  function handleEdit(event: CustomEvent<Transaction>) {
    editingTransaction = event.detail;
    currentTab = "input";
  }

  /**
   * データの保存成功時のハンドラ
   */
  function handleSave() {
    if (editingTransaction === null) {
      // 新規登録時は「入力」タブのままトーストを表示
      showToast(TEXTS.COMMON.SAVE_SUCCESS);
      if (listComponent) {
        listComponent.loadTransactions();
      }
    } else {
      // 編集時は「一覧」へ戻る
      editingTransaction = null;
      currentTab = "list";
      if (listComponent) {
        listComponent.loadTransactions();
      }
    }
  }

  /**
   * キャンセル時のハンドラ
   */
  function handleCancel() {
    editingTransaction = null;
    currentTab = "list";
  }

  /**
   * タブの切り替え処理
   * @param {string} tab
   */
  function switchTab(tab: string) {
    currentTab = tab;
    if (tab === "input") {
      editingTransaction = null;
    }
  }

  // スワイプ管理
  let touchStartX = 0;

  /**
   * タッチ開始時の座標を記録
   * @param {TouchEvent} e
   */
  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX;
  }

  /**
   * タッチ終了時の座標からスワイプ方向を判定し、タブを切り替え
   * @param {TouchEvent} e
   */
  function handleTouchEnd(e: TouchEvent) {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 100) {
      // 100px以上のスワイプで切り替え
      const currentIndex = tabs.indexOf(currentTab);
      if (diff > 0 && currentIndex > 0) {
        switchTab(tabs[currentIndex - 1]);
      } else if (diff < 0 && currentIndex < tabs.length - 1) {
        switchTab(tabs[currentIndex + 1]);
      }
    }
  }
</script>

<main on:touchstart={handleTouchStart} on:touchend={handleTouchEnd}>
  <header>
    <div class="header-content">
      <h1>{TEXTS.APP.TITLE}</h1>
      <button
        class="theme-toggle"
        on:click={toggleTheme}
        aria-label="Toggle theme"
      >
        {#if isDarkMode}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><circle cx="12" cy="12" r="5" /><path
              d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            /></svg
          >
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg
          >
        {/if}
      </button>
    </div>
  </header>

  <nav class="tabs">
    <button
      class:active={currentTab === "input"}
      on:click={() => switchTab("input")}>{TEXTS.APP.TABS.INPUT}</button
    >
    <button
      class:active={currentTab === "list"}
      on:click={() => switchTab("list")}>{TEXTS.APP.TABS.LIST}</button
    >
    <button
      class:active={currentTab === "export"}
      on:click={() => switchTab("export")}>{TEXTS.APP.TABS.EXPORT}</button
    >
  </nav>

  <div class="content">
    {#if currentTab === "input"}
      <Input
        transaction={editingTransaction}
        on:save={handleSave}
        on:cancel={handleCancel}
      />
    {:else if currentTab === "list"}
      <List bind:this={listComponent} on:edit={handleEdit} />
    {:else if currentTab === "export"}
      <Export />
    {/if}
  </div>

  {#if toastVisible}
    <div class="toast">
      {toastMessage}
    </div>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: "Outfit", sans-serif;
    background-color: var(--bg-main);
    color: var(--text-main);
    -webkit-tap-highlight-color: transparent;
    transition:
      background-color 0.3s,
      color 0.3s;
  }

  main {
    max-width: 480px;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-card);
    box-shadow: var(--shadow-large);
  }

  header {
    background: linear-gradient(
      135deg,
      var(--primary) 0%,
      var(--primary-dark) 100%
    );
    color: var(--text-white);
    padding: 1rem;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
  }

  .theme-toggle {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
  }

  .theme-toggle:active {
    background: rgba(255, 255, 255, 0.3);
  }

  h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .tabs {
    display: flex;
    background: var(--bg-card);
    margin: -15px 1rem 0;
    padding: 0.5rem;
    border-radius: 15px;
    box-shadow: var(--shadow);
    position: sticky;
    top: 10px;
    z-index: 10;
  }

  .tabs button {
    flex: 1;
    padding: 0.8rem;
    border: none;
    background: none;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .tabs button.active {
    background: var(--primary);
    color: var(--text-white);
    box-shadow: 0 4px 10px rgba(67, 97, 238, 0.3);
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 2rem 1rem;
    padding-bottom: 4rem;
  }

  .toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.8rem 1.5rem;
    border-radius: 30px;
    font-size: 0.9rem;
    font-weight: 500;
    z-index: 1000;
    animation: fadeInUp 0.3s ease;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translate(-50%, 10px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
</style>
