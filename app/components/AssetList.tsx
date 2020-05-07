import React from 'react';
import styles from './AssetList.css';

export const AssetList = ({ children }: any) => {
  return (
    <ul className={styles.assetList} style={{}}>
      {children}
    </ul>
  );
};
