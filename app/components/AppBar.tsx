import React from 'react';
import Bar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const AppBar = () => {
  return (
    <Bar
      style={{
        WebkitUserSelect: 'none',
        // @ts-ignore
        WebkitAppRegion: 'drag'
      }}
      position={'static'}
      elevation={0}
    >
      <Toolbar>
        <Typography variant={'h6'}>iisy</Typography>
      </Toolbar>
    </Bar>
  );
};

export default AppBar;
