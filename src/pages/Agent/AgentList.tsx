import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const AgentList: React.FC = () => {
  return (
    <div>
      <div className="mt-10">
        <Card>
          <CardContent>
            <Typography variant="h6" style={{ fontWeight: 'bold', color: '#333' }}>
              Agent List
            </Typography>
            <div className="mt-4 text-sm text-gray-600">This page will list all agents. (Placeholder)</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AgentList;
