import React, { useState, useEffect } from 'react';
import events from './events';
import { Channels } from './config';
import { Communication } from './communication';

export const LoginDialogContext = React.createContext({
  openLoginDialogFn: (val: boolean) => {},
  loginDialogOpen: false
});

export const LoginDialogConsumer = ({ children }: any) => {
  return <LoginDialogContext.Consumer>{children}</LoginDialogContext.Consumer>;
};

export const LoginDialogProvider = ({ children }: any) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  events.addListener(Channels.SYNC_LOGIN_DIALOG, val => {
    setDialogOpen(val);
  });
  new Communication().consumeFromMain(
    Channels.SYNC_LOGIN_DIALOG,
    (event, val) => {
      setDialogOpen(val);
    }
  );
  useEffect(() => {
    return () => {
      events.removeAllListeners(Channels.SYNC_LOGIN_DIALOG);
    }
  }, []);

  return (
    <LoginDialogContext.Provider
      value={{
        // @ts-ignore
        openLoginDialogFn: setDialogOpen,
        loginDialogOpen: dialogOpen
      }}
    >
      {children}
    </LoginDialogContext.Provider>
  );
};
