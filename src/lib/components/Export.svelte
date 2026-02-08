<script lang="ts">
  import { getAllTransactions, clearAllTransactions } from "../db/indexeddb";
  import { TEXTS } from "../constants/texts";

  /** データをCSVとしてダウンロード */
  async function downloadCSV() {
    const transactions = await getAllTransactions();

    if (transactions.length === 0) {
      alert(TEXTS.EXPORT.EMPTY_MESSAGE || TEXTS.LIST.EMPTY_MESSAGE);
      return;
    }

    const header =
      "tx01_ymd,tx01_bop_cd,tx01_cat_cd,tx01_memo,tx01_pmt_cd,tx01_amount,tx01_accrued_flg";
    const rows = transactions.map((tx) =>
      [
        tx.ymd,
        tx.bopCd,
        tx.catCd,
        `"${(tx.memo || "").replace(/"/g, '""')}"`, // メモのダブルクォートをエスケープ
        tx.pmtCd,
        tx.amount,
        tx.accruedFlg,
      ].join(","),
    );

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
    link.setAttribute("download", `household_${date}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /** 全データのリセット */
  async function handleReset() {
    if (confirm(TEXTS.EXPORT.CONFIRM_CLEAR)) {
      await clearAllTransactions();
      alert(TEXTS.EXPORT.CLEAR_SUCCESS);
      location.reload();
    }
  }
</script>

<div class="export-container">
  <h2>{TEXTS.EXPORT.TITLE}</h2>

  <div class="card">
    <h3>{TEXTS.EXPORT.TITLE}</h3>
    <p>
      現在保存されているデータをCSV形式でダウンロードします。PC版システムへの取り込みに使用してください。
    </p>
    <button class="primary" on:click={downloadCSV}
      >{TEXTS.EXPORT.BTN_EXPORT}</button
    >
  </div>

  <div class="card warning">
    <h3>{TEXTS.EXPORT.BTN_CLEAR}</h3>
    <p>端末内の全てのデータを削除します。CSV出力後に実行してください。</p>
    <button class="danger" on:click={handleReset}
      >{TEXTS.EXPORT.BTN_CLEAR}</button
    >
  </div>
</div>

<style>
  .export-container {
    padding: 1rem;
  }

  h2 {
    margin-top: 0;
    font-size: 1.25rem;
  }

  .card {
    background: var(--bg-card);
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    margin-bottom: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  h3 {
    margin-top: 0;
    font-size: 1.1rem;
  }

  p {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 1rem;
    line-height: 1.4;
  }

  button {
    width: 100%;
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

  .danger {
    background-color: #dc3545;
    color: white;
  }

  .warning {
    border-left: 4px solid #dc3545;
  }
</style>
