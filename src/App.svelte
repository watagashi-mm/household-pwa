<script lang="ts">
  import Input from "./lib/components/Input.svelte";
  import List from "./lib/components/List.svelte";
  import Export from "./lib/components/Export.svelte";
  import type { Transaction } from "./lib/constants/masters";

  let currentTab = "input";
  let editingTransaction: Transaction | null = null;
  let listComponent: List;

  function handleEdit(event: CustomEvent<Transaction>) {
    editingTransaction = event.detail;
    currentTab = "input";
  }

  function handleSave() {
    editingTransaction = null;
    currentTab = "list";
    if (listComponent) {
      listComponent.loadTransactions();
    }
  }

  function handleCancel() {
    editingTransaction = null;
    currentTab = "list";
  }

  function switchTab(tab: string) {
    currentTab = tab;
    if (tab === "input") {
      editingTransaction = null;
    }
  }
</script>

<main>
  <header>
    <h1>家計簿スマホ入力</h1>
  </header>

  <nav class="tabs">
    <button
      class:active={currentTab === "input"}
      on:click={() => switchTab("input")}>入力</button
    >
    <button
      class:active={currentTab === "list"}
      on:click={() => switchTab("list")}>一覧</button
    >
    <button
      class:active={currentTab === "export"}
      on:click={() => switchTab("export")}>出力</button
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
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: "Outfit", sans-serif;
    background-color: #f8f9fa;
    color: #2b2d42;
    -webkit-tap-highlight-color: transparent;
  }

  main {
    max-width: 480px;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  }

  header {
    background: linear-gradient(135deg, #4361ee 0%, #3f37c9 100%);
    color: white;
    padding: 1.5rem 1rem;
    text-align: center;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
  }

  h1 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .tabs {
    display: flex;
    background: white;
    margin: -15px 1rem 0;
    padding: 0.5rem;
    border-radius: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
    color: #8d99ae;
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .tabs button.active {
    background: #4361ee;
    color: white;
    box-shadow: 0 4px 10px rgba(67, 97, 238, 0.3);
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 2rem 1rem;
    padding-bottom: 4rem;
  }
</style>
