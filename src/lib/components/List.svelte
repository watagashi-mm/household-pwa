<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import {
    BOP_MASTER,
    CATEGORY_MASTER,
    PAYMENT_MASTER,
    type Transaction,
  } from "../constants/masters";
  import { getAllTransactions, deleteTransaction } from "../db/indexeddb";
  import { TEXTS } from "../constants/texts";

  const dispatch = createEventDispatcher();

  let transactions: Transaction[] = [];

  onMount(async () => {
    await loadTransactions();
  });

  /** 取引データをDBから再読み込み */
  export async function loadTransactions() {
    transactions = await getAllTransactions();
  }

  /**
   * 収支区分名を取得
   * @param {number} cd
   */
  function getBopName(cd: number) {
    return BOP_MASTER.find((m) => m.code === cd)?.name || "";
  }

  /**
   * カテゴリ名を取得
   * @param {number} bopCd
   * @param {number} catCd
   */
  function getCatName(bopCd: number, catCd: number) {
    return CATEGORY_MASTER[bopCd]?.find((m) => m.code === catCd)?.name || "";
  }

  /**
   * 支払い方法名を取得
   * @param {number} bopCd
   * @param {number} pmtCd
   */
  function getPmtName(bopCd: number, pmtCd: number) {
    return PAYMENT_MASTER[bopCd]?.find((m) => m.code === pmtCd)?.name || "";
  }

  /**
   * 日付をMM/DD形式でフォーマット
   * @param {number} ymd
   */
  function formatDate(ymd: number) {
    const s = ymd.toString();
    return `${s.substring(4, 6)}/${s.substring(6, 8)}`;
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
    dispatch("edit", tx);
  }
</script>

<div class="list-container">
  <h2>{TEXTS.LIST.TITLE}</h2>

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
            <span class="amount">¥{tx.amount.toLocaleString()}</span>
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
            <button class="edit-btn" on:click={() => handleEdit(tx)}
              >{TEXTS.LIST.BTN_EDIT}</button
            >
            <button class="delete-btn" on:click={() => handleDelete(tx.id)}
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

  h2 {
    margin: 0 0 1.5rem 0.5rem;
    font-size: 1.3rem;
    font-weight: 600;
    color: #2b2d42;
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
    background: white;
    border-radius: 14px;
    padding: 0.8rem 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
    border: 1px solid #f1f3f5;
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
    color: #8d99ae;
    background: #f8f9fa;
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
    color: #2b2d42;
  }

  .item-body {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #2b2d42;
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
    color: #4a4e69;
    background: #f8f9fa;
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
