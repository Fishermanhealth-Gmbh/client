import React, { useContext } from 'react';
import { Communication } from './communication';
import { connect } from 'react-redux';
import { Channels } from './config';
import { addAsset, removeAsset } from '../actions/assets';
import { withSnackbar } from 'notistack';
import { SnackbarData } from '../interfaces/snackbar';
import { Asset } from '../interfaces/asset';

const withCommunication = (WrappedComponent: any) => {
  const communication = new Communication();
  const _hoc = class extends React.Component<{ [key: string]: any }> {
    componentDidMount() {
      communication.consumeFromMain(Channels.ASSET_IS_READY, (event, asset) => {
        console.log(asset);
        this.props.dispatch(addAsset(asset));
      });
      communication.consumeFromMain(
        Channels.SYNC_LOGIN_DIALOG,
        (event, val: boolean) => {
          this.context.openLoginDialogFn(val);
        }
      );
      communication.consumeFromMain(
        Channels.SHOW_MSG,
        (_, data: SnackbarData) => {
          console.log(data);
          this.props.enqueueSnackbar(data.msg, { variant: data.variant });
        }
      );
      communication.consumeFromMain(Channels.REMOVE_ASSET, (_, data: Asset) => {
        this.props.dispatch(removeAsset(data));
      });
    }
    componentWillUnmount() {
      communication.removeListener(Channels.ASSET_IS_READY);
      communication.removeListener(Channels.SHOW_MSG);
    }
    render() {
      return <WrappedComponent communicator={communication} {...this.props} />;
    }
  };
  // @ts-ignore
  return connect(state => state)(withSnackbar(_hoc));
};

export default withCommunication;
