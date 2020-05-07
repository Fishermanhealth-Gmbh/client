import React, { ReactNode, useEffect, useState } from 'react';
import withCommunication from '../utils/withCommunication';
import { Communication } from '../utils/communication';
import LoadingBar from '../components/LoadingBar';
import { Channels } from '../utils/config';
import { Loading } from '../interfaces/loading';
type Props = {
  children: ReactNode;
  communicator: Communication;
};

function App(props: Props) {
  const { children } = props;
  const [loading, setLoading] = useState({
    variant: 'determinate',
    size: 0,
    value: 100
  });

  useEffect(() => {
    props.communicator.consumeFromMain(
      Channels.SYNC_LOADING,
      (event, loading: Loading) => {
        setLoading(loading);
      }
    );
    return () => {
      props.communicator.removeListener(Channels.SYNC_LOADING);
    };
  }, []);

  return (
    <>
      <LoadingBar value={loading.value} variant={loading.variant} />
      {children}
    </>
  );
}

export default withCommunication(App);
