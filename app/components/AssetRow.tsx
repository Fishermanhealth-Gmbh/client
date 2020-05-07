import React, { useEffect, useState } from 'react';
import { Asset } from '../interfaces/asset';
import styles from './AssetRow.css';
import { Client } from '../utils/client';
import { CircularProgress, Button, IconButton, Icon } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import { Channels } from '../utils/config';
import { useStore } from 'react-redux';
import { updateAsset, removeAsset } from '../actions/assets';

const AssetRow: React.FunctionComponent<{ asset: Asset }> = props => {
  if (!props.asset || !props.asset.token) {
    // Login again
  }
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState([]);
  const [mainAsset, setMainAsset] = useState(null);
  const store = useStore();

  function uploadAsset() {
    ipcRenderer.send(Channels.ASSET_IS_READY, props.asset);
  }
  function openAsset() {
    ipcRenderer.send(Channels.OPEN_ASSET, props.asset.tmpFilename);
  }
  function _removeAsset() {
    ipcRenderer.send(Channels.REMOVE_ASSET, props.asset);
    store.dispatch(removeAsset(props.asset));
  }

  useEffect(() => {
    setLoading(true);
    const client = new Client(props.asset.token!);
    client.checkToken(false).then(() => {
      store.dispatch(updateAsset({ ...props.asset, token: client.token }));
      client
        .getSlides(props.asset.mainAssetId!)
        .then(_data => {
          const {
            data: { getSlideGroupByType }
          } = _data;
          if (getSlideGroupByType) {
            setGroup(getSlideGroupByType);
            setMainAsset(getSlideGroupByType[0]);
            return getSlideGroupByType;
          }
        })
        .then(_ => setLoading(false))
        .catch(err => {
          setLoading(false);
          console.log(err);
        });
    });
  }, []);

  return (
    <div className={styles.row}>
      {loading === true && <CircularProgress size={15} />}
      {mainAsset && (
        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <h4>{mainAsset!.name}</h4>
              <h5>{mainAsset!.externalId}</h5>
            </div>
            <div className={styles.info}>
              <IconButton onClick={openAsset} size={'small'}>
                <Icon>open_in_new</Icon>
              </IconButton>
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              onClick={_removeAsset}
              size={'small'}
              color={'secondary'}
              variant={'text'}
            >
              Remove Asset
            </Button>
            <Button
              onClick={uploadAsset}
              size={'small'}
              color={'primary'}
              variant={'outlined'}
            >
              Upload Asset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetRow;
