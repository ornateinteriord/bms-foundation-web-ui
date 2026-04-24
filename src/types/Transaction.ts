// src/types/Transaction.ts
import { BaseResponse } from "./index";

export interface Transaction {
  _id: string;
  member_id: string;
  account_id?: string;
  transaction_type: string;
  amount: number;
  credit: number;
  debit: number;
  balance: number;
  transaction_date: string;
  status: string;
  [key: string]: any;
}

export type GetTransactionsResponse = BaseResponse<Transaction[]>;
