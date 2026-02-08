import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Transaction } from '../constants/masters';

interface HouseholdDB extends DBSchema {
    transactions: {
        key: number;
        value: Transaction;
        indexes: { 'by-ymd': number };
    };
}

const DB_NAME = 'household-db';
const STORE_NAME = 'transactions';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<HouseholdDB>> | null = null;

/**
 * IndexedDBの初期化と取得
 * @returns {Promise<IDBPDatabase<HouseholdDB>>}
 */
export const getDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<HouseholdDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                store.createIndex('by-ymd', 'ymd');
            },
        });
    }
    return dbPromise;
};

/**
 * 取引データの追加
 * @param {Transaction} transaction 
 */
export const addTransaction = async (transaction: Transaction) => {
    const db = await getDB();
    return db.add(STORE_NAME, transaction);
};

/**
 * 取引データの更新
 * @param {Transaction} transaction 
 */
export const updateTransaction = async (transaction: Transaction) => {
    const db = await getDB();
    return db.put(STORE_NAME, transaction);
};

/**
 * 取引データの削除
 * @param {number} id 
 */
export const deleteTransaction = async (id: number) => {
    const db = await getDB();
    return db.delete(STORE_NAME, id);
};

/**
 * 全取引データの取得（日付降順）
 * @returns {Promise<Transaction[]>}
 */
export const getAllTransactions = async () => {
    const db = await getDB();
    // 日付降順で取得するために全て取得してからソート、またはインデックスを使用
    const txs = await db.getAllFromIndex(STORE_NAME, 'by-ymd');
    return txs.reverse(); // 降順
};

/**
 * ストア内の全データを削除
 */
export const clearAllTransactions = async () => {
    const db = await getDB();
    return db.clear(STORE_NAME);
};
