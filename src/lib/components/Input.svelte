<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import {
    BOP_MASTER,
    CATEGORY_MASTER,
    PAYMENT_MASTER,
    type Transaction,
  } from "../constants/masters";
  import { addTransaction, updateTransaction } from "../db/indexeddb";
  import { TEXTS } from "../constants/texts";

  /** 取引データの編集対象（新規の場合はnull） */
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
  let frequentCategories: { code: number; name: string }[] = [];

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

      // localStorageから直近の設定を読み込み
      const lastBop = localStorage.getItem("lastBop");
      const lastPmt = localStorage.getItem("lastPmt");
      const lastCat = localStorage.getItem("lastCat");

      if (lastBop) bopCd = parseInt(lastBop);
      if (lastPmt) pmtCd = parseInt(lastPmt);
      if (lastCat) catCd = parseInt(lastCat);

      if (!lastBop) resetSelectors();
    }
    updateFrequentCategories();
  });

  function updateFrequentCategories() {
    const statsStr = localStorage.getItem(`catStats_${bopCd}`);
    if (statsStr) {
      const stats = JSON.parse(statsStr);
      // カウント順にソートして上位3件
      const topCodes = Object.entries(stats)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 3)
        .map(([code]) => parseInt(code));

      frequentCategories = CATEGORY_MASTER[bopCd].filter((c) =>
        topCodes.includes(c.code),
      );
    } else {
      frequentCategories = [];
    }
  }

  // 収支区分が変わったらカテゴリと支払い方法をリセット
  $: if (bopCd) {
    if (!transaction || bopCd !== transaction.bopCd) {
      // 収支区分が変わったときは直近の保存値があればそれを使う
      const lastCat = localStorage.getItem(`lastCat_${bopCd}`);
      const lastPmt = localStorage.getItem(`lastPmt_${bopCd}`);

      if (lastCat) catCd = parseInt(lastCat);
      else catCd = CATEGORY_MASTER[bopCd][0]?.code || 0;

      if (lastPmt) pmtCd = parseInt(lastPmt);
      else pmtCd = PAYMENT_MASTER[bopCd][0]?.code || 0;

      updateFrequentCategories();
    }
  }

  function resetSelectors() {
    catCd = CATEGORY_MASTER[bopCd][0]?.code || 0;
    pmtCd = PAYMENT_MASTER[bopCd][0]?.code || 0;
  }

  async function handleSubmit() {
    if (!amount) {
      alert(TEXTS.INPUT.ALERT_AMOUNT_REQUIRED);
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
      // localStorageに直近の設定と統計を保存
      localStorage.setItem("lastBop", bopCd.toString());
      localStorage.setItem(`lastCat_${bopCd}`, catCd.toString());
      localStorage.setItem(`lastPmt_${bopCd}`, pmtCd.toString());

      const statsStr = localStorage.getItem(`catStats_${bopCd}`) || "{}";
      const stats = JSON.parse(statsStr);
      stats[catCd] = (stats[catCd] || 0) + 1;
      localStorage.setItem(`catStats_${bopCd}`, JSON.stringify(stats));
    }

    dispatch("save");
    resetForm();
    updateFrequentCategories();
  }

  function resetForm() {
    if (!transaction) {
      // 連続入力のため「金額」のみをクリア
      amount = null;
    }
  }

  function handleCancel() {
    dispatch("cancel");
  }
</script>

<div class="input-form">
  <h2>{transaction ? TEXTS.INPUT.TITLE_EDIT : TEXTS.INPUT.TITLE_ADD}</h2>

  <div class="field">
    <label for="ymd">{TEXTS.INPUT.FIELD_DATE}</label>
    <input type="date" id="ymd" bind:value={ymd} />
  </div>

  <div class="field">
    <span class="label">{TEXTS.INPUT.FIELD_BOP}</span>
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
    <div class="label-row">
      <label for="cat">{TEXTS.INPUT.FIELD_CATEGORY}</label>
      <div class="shortcuts">
        {#each frequentCategories as fcat}
          <button
            class="chip"
            class:active={catCd === fcat.code}
            on:click={() => (catCd = fcat.code)}
          >
            {fcat.name}
          </button>
        {/each}
      </div>
    </div>
    <select id="cat" bind:value={catCd}>
      {#each CATEGORY_MASTER[bopCd] as cat}
        <option value={cat.code}>{cat.name}</option>
      {/each}
    </select>
  </div>

  <div class="field">
    <label for="pmt">{TEXTS.INPUT.FIELD_PAYMENT}</label>
    <select id="pmt" bind:value={pmtCd}>
      {#each PAYMENT_MASTER[bopCd] as pmt}
        <option value={pmt.code}>{pmt.name}</option>
      {/each}
    </select>
  </div>

  <div class="field">
    <label for="amount">{TEXTS.INPUT.FIELD_AMOUNT}</label>
    <input
      type="number"
      id="amount"
      bind:value={amount}
      placeholder={TEXTS.INPUT.FIELD_AMOUNT_PLACEHOLDER}
      inputmode="numeric"
    />
  </div>

  <div class="field">
    <label for="memo">{TEXTS.INPUT.FIELD_MEMO}</label>
    <input
      type="text"
      id="memo"
      bind:value={memo}
      placeholder={TEXTS.INPUT.FIELD_MEMO_PLACEHOLDER}
    />
  </div>

  <div class="field checkbox-field">
    <label>
      <input type="checkbox" bind:checked={accruedFlg} />
      {TEXTS.INPUT.FIELD_ACCRUED}
    </label>
  </div>

  <div class="actions">
    <button class="primary" on:click={handleSubmit}
      >{transaction ? TEXTS.INPUT.BTN_UPDATE : TEXTS.INPUT.BTN_SUBMIT}</button
    >
    {#if transaction}
      <button class="secondary" on:click={handleCancel}
        >{TEXTS.INPUT.BTN_CANCEL}</button
      >
    {/if}
  </div>
</div>

<style>
  .input-form {
    padding: 1rem;
    background: var(--bg-card);
    border-radius: 16px;
    box-shadow: var(--shadow-large);
    border: 1px solid var(--border-color);
  }

  h2 {
    margin-top: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 1.5rem;
  }

  .field {
    margin-bottom: 0.75rem;
  }

  label,
  .label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.25rem;
    font-size: 0.8rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.4rem;
  }

  .label-row label {
    margin-bottom: 0;
  }

  .shortcuts {
    display: flex;
    gap: 0.4rem;
  }

  .chip {
    padding: 0.2rem 0.5rem;
    font-size: 0.7rem;
    border-radius: 6px;
    background: var(--bg-input);
    color: var(--text-muted);
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    flex: none;
    width: auto;
  }

  .chip.active {
    background: #e0e7ff;
    color: #4361ee;
  }

  input[type="date"],
  input[type="number"],
  input[type="text"],
  select {
    width: 100%;
    padding: 0.6rem 0.8rem;
    border: 2px solid var(--border-input);
    border-radius: 10px;
    box-sizing: border-box;
    font-size: 0.95rem;
    font-family: inherit;
    transition: all 0.3s;
    background: var(--bg-input);
    color: var(--text-main);
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: var(--primary);
    background: var(--bg-card);
    box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.1);
  }

  .radio-group {
    display: flex;
    gap: 0.75rem;
  }

  .radio-group label {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    background: var(--bg-input);
    border: 2px solid var(--border-input);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
    color: var(--text-main);
    font-weight: 500;
    text-transform: none;
    letter-spacing: normal;
    font-size: 0.9rem;
    margin-bottom: 0;
  }

  .radio-group input {
    display: none;
  }

  .radio-group label:has(input:checked) {
    background: var(--bg-card);
    border-color: var(--primary);
    color: var(--primary);
    box-shadow: 0 4px 10px rgba(67, 97, 238, 0.1);
  }

  .checkbox-field label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
    color: var(--text-main);
    text-transform: none;
    letter-spacing: normal;
    cursor: pointer;
  }

  .checkbox-field input {
    width: 20px;
    height: 20px;
    accent-color: var(--primary);
  }

  .actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  button {
    flex: 1;
    padding: 1rem;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .primary {
    background: var(--primary);
    color: var(--text-white);
    box-shadow: 0 4px 12px rgba(67, 97, 238, 0.25);
  }

  .secondary {
    background: var(--border-input);
    color: var(--text-muted);
  }

  button:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
</style>
