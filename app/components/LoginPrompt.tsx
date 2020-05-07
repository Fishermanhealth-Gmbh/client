import React, { useState, useContext } from 'react';
import Dialog from '@material-ui/core/Dialog';
import {
  Card,
  CardContent,
  CardActions,
  TextField,
  FormGroup,
  IconButton,
  Icon,
  Button
} from '@material-ui/core';
import { LoginDialogContext } from '../utils/dialogs';
import { Client } from '../utils/client';
import Events from '../utils/events';
import { Channels } from '../utils/config';
import { ipcRenderer } from 'electron';

export const LoginPrompt = () => {
  const { openLoginDialogFn, loginDialogOpen } = useContext(LoginDialogContext);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  async function login() {
    const graph = new Client();
    try {
      const {
        data: { login }
      } = await graph.login({ email, password });

      Events.emit(Channels.SYNC_AUTH_TOKEN, login);
      ipcRenderer.send(Channels.SYNC_AUTH_TOKEN, login);
    } catch (error) {}
  }
  return (
    <Dialog fullWidth disableBackdropClick open={loginDialogOpen}>
      <Card>
        <CardContent>
          <h3>Please sign in</h3>
          <FormGroup>
            <TextField
              autoFocus
              autoComplete={'email'}
              type={'email'}
              // @ts-ignore
              onChange={e => setEmail(e.currentTarget.value)}
              label={'E-Mail'}
              variant={'filled'}
              placeholder={'E-Mail'}
              helperText="Your iisy account email"
            ></TextField>
            <br />
            <TextField
              helperText="Your iisy account password"
              type={'password'}
              label={'Password'}
              // @ts-ignore
              onChange={e => setPassword(e.currentTarget.value)}
              variant={'filled'}
              placeholder={'Password'}
            ></TextField>
          </FormGroup>
        </CardContent>
        <CardActions style={{ float: 'right' }}>
          <Button onClick={login} color={'primary'}>
            Login and continue
          </Button>
        </CardActions>
      </Card>
    </Dialog>
  );
};
