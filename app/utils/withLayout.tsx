import React from 'react';
import AppBar from '../components/AppBar';
import { Container } from '@material-ui/core';
import { Column } from '../components/Column';
import { LoginPrompt } from '../components/LoginPrompt';

export default function withLayout(Children: any) {
  return class extends React.Component {
    render() {
      return (
        <>
          <AppBar />
          <LoginPrompt />
          <Container
            
            style={{
              position: 'absolute',
              height: 'calc(100% - 58px)',
              padding: 0,
              overflowY: 'auto'
            }}
          >
            <Column>
              <Children {...this.props} />
            </Column>
          </Container>
        </>
      );
    }
  };
}
