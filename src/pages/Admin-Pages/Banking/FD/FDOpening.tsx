import React from 'react';
import AccountOpeningForm from '../../../../components/AccountOpening/AccountOpeningForm';


const FDOpening: React.FC = () => {
  return (
    <div style={{ marginTop: 8 }}>
      <AccountOpeningForm defaultAccountType="FD" title="FD Account Opening" />
    </div>
  );
};

export default FDOpening;