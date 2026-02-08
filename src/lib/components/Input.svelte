<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import {
    BOP_MASTER,
    CATEGORY_MASTER,
    PAYMENT_MASTER,
    type Transaction,
  } from "../constants/masters";
  import { addTransaction, updateTransaction } from "../db/indexeddb";

  export let transaction: Transaction | null = null;

  const dispatch = createEventDispatcher();

  let ymd = "";
  let bopCd = 2; // デフォルト支出
  let catCd = 0;
  let pmtCd = 0;
  let amount: number | null = null;
  let memo = "";
  let accruedFlg = false;

  // 初期化
  onMount(() => {
    if (transaction) {
      const s = transaction.ymd.toString();
      ymd = `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)}`;
      bopCd = transaction.bopCd;
      catCd = transaction.catCd;
      pmtCd = transaction.pmtCd;
      amount = transaction.amount;
      memo = transaction.memo;
      accruedFlg = !!transaction.accruedFlg;
    } else {
      const now = new Date();
      ymd = now.toISOString().split("T")[0];
      resetSelectors();
    }
  });

  // 収支区分が変わったらカテゴリと支払い方法をリセット
  $: if (bopCd) {
    if (!transaction || bopCd !== transaction.bopCd) {
      resetSelectors();
    }
  }

  function resetSelectors() {
    catCd = CATEGORY_MASTER[bopCd][0]?.code || 0;
    pmtCd = PAYMENT_MASTER[bopCd][0]?.code || 0;
  }

  async function handleSubmit() {
    if (!amount) {
      alert("金額を入力してください");
      return;
    }

    const data: Transaction = {
      ymd: parseInt(ymd.replace(/-/g, "")),
      bopCd,
      catCd,
      memo,
      pmtCd,
      amount,
      accruedFlg: accruedFlg ? 1 : 0,
    };

    if (transaction?.id) {
      data.id = transaction.id;
      await updateTransaction(data);
    } else {
      await addTransaction(data);
    }

    dispatch("save");
    resetForm();
  }

  function resetForm() {
    if (!transaction) {
      const now = new Date();
      ymd = now.toISOString().split("T")[0];
      bopCd = 2;
      amount = null;
      memo = "";
      accruedFlg = false;
      resetSelectors();
    }
  }

  function handleCancel() {
    dispatch("cancel");
  }
</script>

<div class="input-form">
  <h2>{transaction ? "データ編集" : "データ登録"}</h2>

  <div class="field">
    <label for="ymd">日付</label>
    <input type="date" id="ymd" bind:value={ymd} />
  </div>

  <div class="field">
    <span class="label">収支区分</span>
    <div class="radio-group">
      {#each BOP_MASTER as bop}
        <label>
          <input type="radio" name="bop" value={bop.code} bind:group={bopCd} />
          {bop.name}
        </label>
      {/each}
    </div>
  </div>

  <div class="field">
    <label for="cat">カテゴリ</label>
    <select id="cat" bind:value={catCd}>
      {#each CATEGORY_MASTER[bopCd] as cat}
        <option value={cat.code}>{cat.name}</option>
      {/each}
    </select>
  </div>

  <div class="field">
    <label for="pmt">支払い方法</label>
    <select id="pmt" bind:value={pmtCd}>
      {#each PAYMENT_MASTER[bopCd] as pmt}
        <option value={pmt.code}>{pmt.name}</option>
      {/each}
    </select>
  </div>

  <div class="field">
    <label for="amount">金額</label>
    <input
      type="number"
      id="amount"
      bind:value={amount}
      placeholder="金額を入力"
      inputmode="numeric"
    />
  </div>

  <div class="field">
    <label for="memo">メモ</label>
    <input type="text" id="memo" bind:value={memo} placeholder="メモを入力" />
  </div>

  <div class="field checkbox-field">
    <label>
      <input type="checkbox" bind:checked={accruedFlg} />
      未払いフラグ
    </label>
  </div>

  <div class="actions">
    <button class="primary" on:click={handleSubmit}
      >{transaction ? "更新" : "登録"}</button
    >
    {#if transaction}
      <button class="secondary" on:click={handleCancel}>キャンセル</button>
    {/if}
  </div>
</div>

<style>
  .input-form {
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  h2 {
    margin-top: 0;
    font-size: 1.25rem;
  }

  .field {
    margin-bottom: 1rem;
  }

  label,
  .label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }

  input[type="date"],
  input[type="number"],
  input[type="text"],
  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1rem;
  }

  .radio-group {
    display: flex;
    gap: 1rem;
  }

  .radio-group label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: normal;
  }

  .checkbox-field label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: normal;
  }

  .checkbox-field input {
    width: auto;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  button {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }

  .primary {
    background-color: #007bff;
    color: white;
  }

  .secondary {
    background-color: #6c757d;
    color: white;
  }

  button:active {
    opacity: 0.8;
  }
</style>
