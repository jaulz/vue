import { WithVariantPropsAndClassesList, TAlertConfigKeys } from '@variantjs/core';
import { HTMLAttributes } from 'vue';
import { Data, IconProp } from '../misc';

export type TAlertOptions = WithVariantPropsAndClassesList<{
  text?: string,
  tagName?: string,
  bodyTagName?: string,
  dismissible?: boolean,
  show?: boolean,
  timeout?: number,
  animate?: boolean,
  closeIcon?: IconProp,
}, TAlertConfigKeys> & HTMLAttributes & Data;