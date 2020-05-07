import React from 'react';

export const Column = ({ children }: any) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%'
      }}
    >
      {children}
    </div>
  );
};
