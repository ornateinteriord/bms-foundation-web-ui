import React from 'react';
import AccountOpeningForm from '../../../../components/AccountOpening/AccountOpeningForm';



const PigmyOpening: React.FC = () => {
  return (
    <div style={{ marginTop: 8 }}>
      <AccountOpeningForm defaultAccountType="PIGMY" title="PIGMY Account Opening" />
    </div>
  );
};

export default PigmyOpening;