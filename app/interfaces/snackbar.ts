import { Asset } from './asset';

export type SnackbarData = {
  msg: string;
  variant: 'success' | 'warning' | 'info';
} & Asset;
