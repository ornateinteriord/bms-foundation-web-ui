import React from 'react';
import ViewAllTemplate from '../Banking/ViewAllTemplate';
import { ColumnDefinition } from '../../../utils/AdminReusableTable';

type ODRow = {
  accountNo: string;
  accountHolder: string;
  dateOfOpening?: string;
  interestRate?: string | number;
  duration?: string;
  balance?: number;
  action?: string;
  status?: string;
};

const OD_COLUMNS: ColumnDefinition<ODRow>[] = [
  { id: 'accountNo', label: 'Account No', sortable: true },
  { id: 'accountHolder', label: 'Account Holder', sortable: true },
  { id: 'dateOfOpening', label: 'Date of Opening', sortable: true },
  { id: 'interestRate', label: 'Interest Rate' },
  { id: 'duration', label: 'Duration' },
  { id: 'balance', label: 'Balance', align: 'right' },
  { id: 'action', label: 'Action', align: 'center' },
  { id: 'status', label: 'Status' },
];

const MOCK_DATA: ODRow[] = [];

const ODViewAll: React.FC = () => {
  return (
    <div style={{ marginTop: 60 }}>
      <ViewAllTemplate title="Overdraft Account Details" columns={OD_COLUMNS} data={MOCK_DATA} />
    </div>
  );
};

export default ODViewAll;
