<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { BOP_MASTER, CATEGORY_MASTER, PAYMENT_MASTER, type Transaction } from '../constants/masters';
  import { getAllTransactions, deleteTransaction } from '../db/indexeddb';

  const dispatch = createEventDispatcher();

  let transactions: Transaction[] = [];

  onMount(async () => {
    await loadTransactions();
  });

  export async function loadTransactions() {
    transactions = await getAllTransactions();
  }

  function getBopName(cd: number) {
    return BOP_MASTER.find(m => m.code === cd)?.name || '';
  }

  function getCatName(bopCd: number, catCd: number) {
    return CATEGORY_MASTER[bopCd]?.find(m => m.code === catCd)?.name || '';
  }

  function getPmtName(bopCd: number, pmtCd: number) {
    return PAYMENT_MASTER[bopCd]?.find(m => m.code === pmtCd)?.name || '';
  }

  function formatDate(ymd: number) {
    const s = ymd.toString();
    return `${s.substring(4, 6)}/${s.substring(6, 8)}`;
  }

  async function handleDelete(id: number | undefined) {
    if (!id) return;
    if (confirm('削除しますか？')) {
      await deleteTransaction(id);
      await loadTransactions();
    }
  }

  function handleEdit(tx: Transaction) {
    dispatch('edit', tx);
  }
</script>

<div class="list-container">
  <h2>データ一覧</h2>
  
  {#if transactions.length === 0}
    <p class="empty">データがありません</p>
  {:else}
    <div class="list">
      {#each transactions as tx}
        <div class="item">
          <div class="item-header">
            <span class="date">{formatDate(tx.ymd)}</span>
            <span class="bop {tx.bopCd === 1 ? 'income' : 'expense'}">{getBopName(tx.bopCd)}</span>
            <span class="amount">¥{tx.amount.toLocaleString()}</span>
          </div>
          <div class="item-body">
            <span class="category">{getCatName(tx.bopCd, tx.catCd)}</span>
            <span class="payment">({getPmtName(tx.bopCd, tx.pmtCd)})</span>
            {#if tx.accruedFlg === 1}
              <span class="accrued">未払い</span>
            {/if}
          </div>
          {#if tx.memo}
            <div class="item-memo">{tx.memo}</div>
          {/if}
          <div class="item-actions">
            <button class="edit-btn" on:click={() => handleEdit(tx)}>編集</button>
            <button class="delete-btn" on:click={() => handleDelete(tx.id)}>削除</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .list-container {
    padding: 1rem;
  }

  h2 {
    margin-top: 0;
    font-size: 1.25rem;
  }

  .empty {
    text-align: center;
    color: #888;
    margin-top: 2rem;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .item {
    background: white;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 0.75rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  .item-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .date {
    font-weight: bold;
    font-size: 0.9rem;
    color: #555;
  }

  .bop {
    font-size: 0.75rem;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    color: white;
  }

  .income { background-color: #28a745; }
  .expense { background-color: #dc3545; }

  .amount {
    margin-left: auto;
    font-weight: bold;
    font-size: 1.1rem;
  }

  .item-body {
    display: flex;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #666;
  }

  .accrued {
    color: #e67e22;
    font-weight: bold;
  }

  .item-memo {
    margin-top: 0.4rem;
    font-size: 0.85rem;
    color: #444;
    font-style: italic;
  }

  .item-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid #f5f5f5;
  }

  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .edit-btn { color: #007bff; }
  .delete-btn { color: #dc3545; }
</style>
