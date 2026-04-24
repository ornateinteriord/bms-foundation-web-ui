import AdminReusableTable, { ColumnDefinition } from '../../../utils/AdminReusableTable';
import React from 'react';

interface ViewAllTemplateProps<T> {
  title: string;
  columns: ColumnDefinition<T>[];
  data?: T[];
  isLoading?: boolean;
  headerComponent?: React.ReactNode; // optional header/form component to render above table
}

const ViewAllTemplate = <T extends Record<string, any>>({ title, columns, data = [], isLoading = false, headerComponent }: ViewAllTemplateProps<T>) => {
  return (
    <div style={{ padding: '1rem 1.5rem' }}>
      {headerComponent && <div style={{ marginBottom: 20 }}>{headerComponent}</div>}
      <AdminReusableTable
        title={title}
        columns={columns}
        data={data}
        isLoading={isLoading}
        enableSelection={false}
      />
    </div>
  );
};

export default ViewAllTemplate;
