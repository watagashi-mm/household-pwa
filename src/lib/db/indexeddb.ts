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

export const addTransaction = async (transaction: Transaction) => {
    const db = await getDB();
    return db.add(STORE_NAME, transaction);
};

export const updateTransaction = async (transaction: Transaction) => {
    const db = await getDB();
    return db.put(STORE_NAME, transaction);
};

export const deleteTransaction = async (id: number) => {
    const db = await getDB();
    return db.delete(STORE_NAME, id);
};

export const getAllTransactions = async () => {
    const db = await getDB();
    // 日付降順で取得するために全て取得してからソート、またはインデックスを使用
    const txs = await db.getAllFromIndex(STORE_NAME, 'by-ymd');
    return txs.reverse(); // 降順
};

export const clearAllTransactions = async () => {
    const db = await getDB();
    return db.clear(STORE_NAME);
};
