import React, { useContext, Props, ReactNode } from 'react';
import Progress from '@material-ui/core/LinearProgress';

const LoadingBar = (props: any) => {
  return (
    <Progress
      style={{
        top: 0,
        position: 'fixed',
        left: '0',
        width: '100%',
        zIndex: 2000
      }}
      variant={props.variant}
      value={props.value}
      color={'secondary'}
    />
  );
};

export default LoadingBar;
