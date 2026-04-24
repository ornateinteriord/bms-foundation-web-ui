import React from 'react';
import AccountDetailsTable from '../../../components/AccountOpening/AccountDetailsTable';

/* =========================
   SB CLOSE DATA & COLUMNS
========================= */

export const CLOSE_SB_DATA: any[] = [
  {
    accountNo: 'SB1003',
    accountHolder: 'Old User',
    dateOfOpening: '2019-05-10',
    closeDate: '2025-12-01',
    reason: 'Dormant',
    action: '',
  },
];

export const CLOSE_SB_COLUMNS = [
  { key: 'accountNo', label: 'Account No' },
  { key: 'accountHolder', label: 'Account Holder' },
  { key: 'operation', label: 'Operation' },
  { key: 'balance', label: 'Balance' },
  { key: 'status', label: 'Status' },
  { key: 'accountClose', label: 'Account Close' },
];

/* =========================
   CA CLOSE DATA & COLUMNS
========================= */

export const CLOSE_CA_DATA: any[] = [
  {
    accountNo: 'CA2003',
    accountHolder: 'Old Corp',
    dateOfOpening: '2018-08-12',
    closeDate: '2025-11-20',
    reason: 'Closure by request',
    action: '',
  },
];

export const CLOSE_CA_COLUMNS = [
  { key: 'accountNo', label: 'Account No' },
  { key: 'accountHolder', label: 'Account Holder' },
  { key: 'operation', label: 'Operation' },
  { key: 'balance', label: 'Balance' },
  { key: 'status', label: 'Status' },
  { key: 'accountClose', label: 'Account Close' },
];

/* =========================
   LOAN CLOSE DATA & COLUMNS
========================= */

export const CLOSE_LOAN_DATA: any[] = [
  {
    accountNo: 'LN1001',
    accountHolder: 'John Doe',
    dateOfOpening: '2020-03-15',
    loanType: 'Personal Loan',
    closeDate: '2025-12-10',
    reason: 'Fully Repaid',
    action: '',
  },
  {
    accountNo: 'LN1002',
    accountHolder: 'Jane Smith',
    dateOfOpening: '2019-07-22',
    loanType: 'Home Loan',
    closeDate: '2025-12-05',
    reason: 'Foreclosure',
    action: '',
  },
];

export const CLOSE_LOAN_COLUMNS = [
  { key: 'accountNo', label: 'Account No' },
  { key: 'accountHolder', label: 'Account Holder' },
  { key: 'loanType', label: 'Loan Type' },
  { key: 'interestRate', label: 'Interest Rate' },
  { key: 'duration', label: 'Duration' },
  { key: 'balance', label: 'Balance' },
  { key: 'status', label: 'Status' },
  { key: 'accountClose', label: 'Account Close' },
];

/* =========================
   OD CLOSE DATA & COLUMNS
========================= */

export const CLOSE_OD_DATA: any[] = [
  {
    accountNo: 'OD2001',
    accountHolder: 'Business Corp',
    dateOfOpening: '2021-01-10',
    closeDate: '2025-12-08',
    reason: 'Account Closure',
    action: '',
  },
  {
    accountNo: 'OD2002',
    accountHolder: 'Tech Solutions',
    dateOfOpening: '2020-11-05',
    closeDate: '2025-12-01',
    reason: 'Bankruptcy',
    action: '',
  },
];

export const CLOSE_OD_COLUMNS = [
  { key: 'accountNo', label: 'Account No' },
  { key: 'accountHolder', label: 'Account Holder' },
  { key: 'loanType', label: 'Loan Type' },
  { key: 'interestRate', label: 'Interest Rate' },
  { key: 'duration', label: 'Duration' },
  { key: 'balance', label: 'Balance' },
  { key: 'status', label: 'Status' },
  { key: 'accountClose', label: 'Account Close' },
];

/* =========================
   COMPONENTS
========================= */

export const CloseSBTable: React.FC = () => (
  <AccountDetailsTable
    title="List of SB Ledgers Account"
    data={CLOSE_SB_DATA}
    columns={CLOSE_SB_COLUMNS}
    accountType="SB"
  />
);

export const CloseCATable: React.FC = () => (
  <AccountDetailsTable
    title="List of CA Ledgers Account"
    data={CLOSE_CA_DATA}
    columns={CLOSE_CA_COLUMNS}
    accountType="CA"
  />
);

export const CloseLoanTable: React.FC = () => (
  <AccountDetailsTable
    title="List of Closed Loan Accounts"
    data={CLOSE_LOAN_DATA}
    columns={CLOSE_LOAN_COLUMNS}
    accountType="LOAN"
  />
);

export const CloseODTable: React.FC = () => (
  <AccountDetailsTable
    title="List of Closed Overdraft Accounts"
    data={CLOSE_OD_DATA}
    columns={CLOSE_OD_COLUMNS}
    accountType="OD"
  />
);

/* =========================
   DEFAULT EXPORT
========================= */

export default CloseSBTable;
