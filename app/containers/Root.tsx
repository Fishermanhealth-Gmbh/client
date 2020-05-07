import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { Store } from '../reducers/types';
import Routes from '../Routes';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import { SnackbarProvider } from 'notistack';
import { ApolloProvider } from '@apollo/react-hooks';

import theme from '../utils/theme';
import { Client } from '../utils/client';
import { LoginDialogProvider } from '../utils/dialogs';
const client = new Client('');

type Props = {
  store: Store;
  history: History;
};

const Root = ({ store, history }: Props) => {
  useEffect(() => {}, []);
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <ApolloProvider client={client.graph}>
          <ThemeProvider theme={theme}>
            <SnackbarProvider autoHideDuration={10000} dense>
              <LoginDialogProvider>
                <CssBaseline />
                <Routes />
              </LoginDialogProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </ApolloProvider>
      </ConnectedRouter>
    </Provider>
  );
};

export default hot(Root);
