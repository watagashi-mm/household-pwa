<script lang="ts">
  import { onMount } from "svelte";
  import { type Transaction } from "../constants/masters";
  import { getAllTransactions, deleteTransaction } from "../db/indexeddb";
  import { TEXTS } from "../constants/texts";
  import {
    formatDate,
    formatAmount,
    getBopName,
    getCatName,
    getPmtName,
  } from "../utils/formatters";

  let { onedit } = $props<{ onedit: (tx: Transaction) => void }>();

  let transactions = $state<Transaction[]>([]);

  /** 収入合計 */
  let totalIncome = $derived(
    transactions
      .filter((tx) => tx.bopCd === 1)
      .reduce((sum, tx) => sum + tx.amount, 0),
  );

  /** 支出合計 */
  let totalExpense = $derived(
    transactions
      .filter((tx) => tx.bopCd === 2)
      .reduce((sum, tx) => sum + tx.amount, 0),
  );

  onMount(async () => {
    await loadTransactions();
  });

  /** 取引データをDBから再読み込み */
  export async function loadTransactions() {
    transactions = await getAllTransactions();
  }

  /**
   * 指定したIDのデータを削除
   * @param {number | undefined} id
   */
  async function handleDelete(id: number | undefined) {
    if (!id) return;
    if (confirm(TEXTS.LIST.CONFIRM_DELETE)) {
      await deleteTransaction(id);
      await loadTransactions();
    }
  }

  /**
   * 編集イベントを発行
   * @param {Transaction} tx
   */
  function handleEdit(tx: Transaction) {
    if (onedit) onedit(tx);
  }
</script>

<div class="list-container">
  <div class="header-row">
    <h2>{TEXTS.LIST.TITLE}</h2>
    <div class="totals-summary">
      <div class="total-item income">
        <span class="label">{TEXTS.LIST.TOTAL_INCOME}</span>
        <span class="value">{formatAmount(totalIncome)}</span>
      </div>
      <div class="total-item expense">
        <span class="label">{TEXTS.LIST.TOTAL_EXPENSE}</span>
        <span class="value">{formatAmount(totalExpense)}</span>
      </div>
    </div>
  </div>

  {#if transactions.length === 0}
    <p class="empty">{TEXTS.LIST.EMPTY_MESSAGE}</p>
  {:else}
    <div class="list">
      {#each transactions as tx}
        <div class="item">
          <div class="item-header">
            <span class="date">{formatDate(tx.ymd)}</span>
            <span class="bop {tx.bopCd === 1 ? 'income' : 'expense'}"
              >{getBopName(tx.bopCd)}</span
            >
            <span class="amount">{formatAmount(tx.amount)}</span>
          </div>
          <div class="item-body">
            <span class="category">{getCatName(tx.bopCd, tx.catCd)}</span>
            <span class="payment">({getPmtName(tx.bopCd, tx.pmtCd)})</span>
            {#if tx.accruedFlg === 1}
              <span class="accrued">{TEXTS.LIST.ACCRUED_LABEL}</span>
            {/if}
          </div>
          {#if tx.memo}
            <div class="item-memo">{tx.memo}</div>
          {/if}
          <div class="item-actions">
            <button class="edit-btn" onclick={() => handleEdit(tx)}
              >{TEXTS.LIST.BTN_EDIT}</button
            >
            <button class="delete-btn" onclick={() => handleDelete(tx.id)}
              >{TEXTS.LIST.BTN_DELETE}</button
            >
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .list-container {
    padding: 0;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin: 0 0.5rem 1.2rem 0.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .totals-summary {
    display: flex;
    gap: 0.6rem;
    align-items: center;
  }

  .total-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.3rem 0.8rem;
    border-radius: 20px; /* バッジ風に丸く */
    min-width: 80px;
    border: 1px solid transparent;
  }

  .total-item .label {
    font-size: 0.6rem;
    font-weight: 800;
    margin-bottom: -0.1rem;
    opacity: 0.8;
  }

  .total-item .value {
    font-size: 0.9rem;
    font-weight: 800;
  }

  /* 収入バッジ: ライト/ダーク共通で視認性の良い配色 */
  .total-item.income {
    background: rgba(76, 201, 240, 0.15);
    color: #0b84a5; /* 濃いめの青/シアン */
    border-color: rgba(76, 201, 240, 0.3);
  }
  :global(.dark-mode) .total-item.income {
    background: rgba(76, 201, 240, 0.2);
    color: #4cc9f0;
    border-color: rgba(76, 201, 240, 0.4);
  }

  /* 支出バッジ: ライト/ダーク共通で視認性の良い配色 */
  .total-item.expense {
    background: rgba(247, 37, 133, 0.12);
    color: #b5175f; /* 濃いめのピンク */
    border-color: rgba(247, 37, 133, 0.25);
  }
  :global(.dark-mode) .total-item.expense {
    background: rgba(247, 37, 133, 0.2);
    color: #ff4d9e;
    border-color: rgba(247, 37, 133, 0.4);
  }

  .empty {
    text-align: center;
    color: #8d99ae;
    margin-top: 3rem;
    font-style: italic;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .item {
    background: var(--bg-card);
    border-radius: 14px;
    padding: 0.8rem 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
    border: 1px solid var(--border-color);
    transition: transform 0.2s;
  }

  .item:active {
    transform: scale(0.98);
  }

  .item-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
  }

  .date {
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--text-muted);
    background: var(--bg-input);
    padding: 0.2rem 0.6rem;
    border-radius: 8px;
  }

  .bop {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 8px;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .income {
    background-color: #4cc9f0;
  }
  .expense {
    background-color: #f72585;
  }

  .amount {
    margin-left: auto;
    font-weight: 700;
    font-size: 1.15rem;
    color: var(--text-main);
  }

  .item-body {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-main);
    font-weight: 500;
  }

  .payment {
    color: #8d99ae;
    font-size: 0.8rem;
  }

  .accrued {
    background: #fff0f6;
    color: #f72585;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.1rem 0.4rem;
    border-radius: 6px;
    border: 1px solid #ffdeeb;
  }

  .item-memo {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-muted);
    background: var(--bg-input);
    padding: 0.4rem 0.6rem;
    border-radius: 8px;
    line-height: 1.4;
  }

  .item-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1.25rem;
    margin-top: 0.6rem;
    padding-top: 0.5rem;
    border-top: 1px solid #f8f9fa;
  }

  button {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: opacity 0.2s;
  }

  .edit-btn {
    color: #4361ee;
  }
  .delete-btn {
    color: #f72585;
    opacity: 0.7;
  }

  button:active {
    opacity: 0.5;
  }
</style>
