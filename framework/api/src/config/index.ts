import fse, { ensureFileSync } from 'fs-extra';
import {
  KF_CONFIG_DEFAULT_PATH,
  KF_CONFIG_PATH,
  KF_HOME,
  KF_INSTRUMENTS_DEFAULT_PATH,
  KF_INSTRUMENTS_PATH,
  KUNGFU_RESOURCES_DIR,
} from './pathConfig';
import path from 'path';

export const initKfConfig = () => {
  if (!fse.existsSync(KF_CONFIG_PATH)) {
    ensureFileSync(KF_CONFIG_PATH);
    const kfConfigJSON = fse.readJsonSync(KF_CONFIG_DEFAULT_PATH);
    fse.outputJsonSync(KF_CONFIG_PATH, kfConfigJSON);
  }
};

export const initKfDefaultInstruments = () => {
  if (!fse.existsSync(KF_INSTRUMENTS_PATH)) {
    ensureFileSync(KF_INSTRUMENTS_PATH);
    const kfInstrumentsJSON = fse.readJsonSync(KF_INSTRUMENTS_DEFAULT_PATH);
    fse.outputJsonSync(KF_INSTRUMENTS_PATH, kfInstrumentsJSON);
  }
};

export const ensureKungfuKey = () => {
  const rootKey = path.join(KF_HOME, 'kungfu-root.key');
  const sourceRootKey = path.join(
    KUNGFU_RESOURCES_DIR,
    'key',
    'kungfu-root.key',
  );
  const traderKey = path.join(KF_HOME, 'kungfu-trader.key');
  const sourceTraderKey = path.join(
    KUNGFU_RESOURCES_DIR,
    'key',
    'kungfu-trader.key',
  );

  if (!fse.existsSync(rootKey) && fse.existsSync(sourceRootKey)) {
    fse.copyFileSync(sourceRootKey, rootKey);
  }

  if (!fse.existsSync(traderKey) && fse.existsSync(sourceTraderKey)) {
    fse.copyFileSync(sourceTraderKey, traderKey);
  }
};
