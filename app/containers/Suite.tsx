import React from 'react';
import withLayout from '../utils/withLayout';
import { connect } from 'react-redux';
import { AssetList } from '../components/AssetList';
import AssetRow from '../components/AssetRow';
import { Asset } from '../interfaces/asset';
import styles from './Suite.css';
// @ts-ignore
import emptyImage from '../resources/illustrations/empty.png';

const Suite = ({ assets }: any) => {
  const items = assets.items;

  if (items.length > 0) {
    return (
      <AssetList>
        {items.map((asset: Asset) => {
          return <AssetRow asset={asset} key={asset.tmpFilename}></AssetRow>;
        })}
      </AssetList>
    );
  }

  return (
    <div className={styles.emptyContainer}>
      <img width={350} src={emptyImage}></img>
      <h4 className={styles.emptyLine}>No assets on your computer.</h4>
    </div>
  );
};

export default connect(state => state)(withLayout(Suite));
