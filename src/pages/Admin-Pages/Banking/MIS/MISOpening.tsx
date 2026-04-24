import React from 'react';
import AccountOpeningForm from '../../../../components/AccountOpening/AccountOpeningForm';


const MISOpening: React.FC = () => {
  return (
    <div style={{ marginTop: 8 }}>
      <AccountOpeningForm defaultAccountType="MIS" title="MIS Account Opening" />
    </div>
  );
};

export default MISOpening;