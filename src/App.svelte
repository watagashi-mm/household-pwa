<script lang="ts">
  import Input from './lib/components/Input.svelte';
  import List from './lib/components/List.svelte';
  import Export from './lib/components/Export.svelte';
  import type { Transaction } from './lib/constants/masters';

  let currentTab = 'input';
  let editingTransaction: Transaction | null = null;
  let listComponent: List;

  function handleEdit(event: CustomEvent<Transaction>) {
    editingTransaction = event.detail;
    currentTab = 'input';
  }

  function handleSave() {
    editingTransaction = null;
    currentTab = 'list';
    if (listComponent) {
      listComponent.loadTransactions();
    }
  }

  function handleCancel() {
    editingTransaction = null;
    currentTab = 'list';
  }

  function switchTab(tab: string) {
    currentTab = tab;
    if (tab === 'input') {
      editingTransaction = null;
    }
  }
</script>

<main>
  <header>
    <h1>家計簿スマホ入力</h1>
  </header>

  <nav class="tabs">
    <button class:active={currentTab === 'input'} on:click={() => switchTab('input')}>入力</button>
    <button class:active={currentTab === 'list'} on:click={() => switchTab('list')}>一覧</button>
    <button class:active={currentTab === 'export'} on:click={() => switchTab('export')}>出力</button>
  </nav>

  <div class="content">
    {#if currentTab === 'input'}
      <Input 
        transaction={editingTransaction} 
        on:save={handleSave} 
        on:cancel={handleCancel} 
      />
    {:else if currentTab === 'list'}
      <List 
        bind:this={listComponent} 
        on:edit={handleEdit} 
      />
    {:else if currentTab === 'export'}
      <Export />
    {/if}
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: #f0f2f5;
    color: #333;
    -webkit-tap-highlight-color: transparent;
  }

  main {
    max-width: 600px;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    background-color: #007bff;
    color: white;
    padding: 1rem;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  h1 {
    margin: 0;
    font-size: 1.2rem;
  }

  .tabs {
    display: flex;
    background: white;
    border-bottom: 1px solid #ddd;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .tabs button {
    flex: 1;
    padding: 1rem;
    border: none;
    background: none;
    font-size: 1rem;
    color: #666;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s;
  }

  .tabs button.active {
    color: #007bff;
    border-bottom-color: #007bff;
    font-weight: bold;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 2rem;
  }
</style>
