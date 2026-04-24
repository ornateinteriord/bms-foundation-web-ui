import React from 'react';
import ViewAllTemplate from '../Banking/ViewAllTemplate';
import { ColumnDefinition } from '../../../utils/AdminReusableTable';

type LoanRow = {
  accountNo: string;
  accountHolder: string;
  dateOfOpening: string;
  loanType?: string;
  interestRate?: string | number;
  duration?: string;
  balance?: number;
  status?: string;
};

const LOAN_COLUMNS: ColumnDefinition<LoanRow>[] = [
  { id: 'accountNo', label: 'Account No', sortable: true },
  { id: 'accountHolder', label: 'Account Holder', sortable: true },
  { id: 'dateOfOpening', label: 'Date of Opening', sortable: true },
  { id: 'loanType', label: 'Loan Type', sortable: true },
  { id: 'interestRate', label: 'Interest Rate' },
  { id: 'duration', label: 'Duration' },
  { id: 'balance', label: 'Balance', align: 'right' },
  { id: 'action', label: 'Action', align: 'center' },
  { id: 'status', label: 'Status' },
];

const MOCK_DATA: LoanRow[] = [];

const LoanViewAll: React.FC = () => {
  return (
    <div style={{ marginTop: 60 }}>
      <ViewAllTemplate title="Loan Account Details" columns={LOAN_COLUMNS} data={MOCK_DATA} />
    </div>
  );
};

export default LoanViewAll;
