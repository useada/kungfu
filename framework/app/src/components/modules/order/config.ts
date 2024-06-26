import { DealTradingTableHooks } from '@kungfu-trader/kungfu-js-api/hooks/dealTradingTableHook';
import { isTdStrategyCategory } from '@kungfu-trader/kungfu-js-api/utils/busiUtils';
import VueI18n from '@kungfu-trader/kungfu-js-api/language';
const { t } = VueI18n.global;

const buildSorter =
  (dataIndex: keyof KungfuApi.OrderResolved) =>
  (a: KungfuApi.OrderResolved, b: KungfuApi.OrderResolved) =>
    (+Number(a[dataIndex]) || 0) - (+Number(b[dataIndex]) || 0);

const buildStrSorter =
  (dataIndex: keyof KungfuApi.OrderResolved) =>
  (a: KungfuApi.OrderResolved, b: KungfuApi.OrderResolved) =>
    a[dataIndex].toString().localeCompare(b[dataIndex].toString());

export const getColumns = (
  kfLocation: KungfuApi.KfLocation,
  isHistory = false,
): KfTradingDataTableHeaderConfig[] =>
  (globalThis.HookKeeper.getHooks().dealTradingTable as DealTradingTableHooks)
    .trigger(kfLocation, 'order')
    .getColumns<KfTradingDataTableHeaderConfig>([
      {
        type: 'string',
        name: t('orderConfig.update_time'),
        dataIndex: 'update_time_resolved',
        width: isHistory ? 160 : 120,
        sorter: buildSorter('update_time'),
      },
      {
        type: 'string',
        name: t('orderConfig.instrument_id'),
        dataIndex: 'instrument_id',
        sorter: buildStrSorter('instrument_id'),
        width: 80,
      },
      {
        type: 'string',
        name: '',
        dataIndex: 'side',
        width: 40,
      },
      {
        type: 'string',
        name: '',
        dataIndex: 'offset',
        width: 40,
      },
      {
        type: 'number',
        name: t('orderConfig.limit_price'),
        dataIndex: 'limit_price',
        width: 120,
        sorter: buildSorter('limit_price'),
      },
      {
        type: 'number',
        name: `${t('orderConfig.clinch')}/${t('orderConfig.all')}`,
        dataIndex: 'volume_left',
        width: 120,
        sorter: (a: KungfuApi.OrderResolved, b: KungfuApi.OrderResolved) => {
          return +Number(a.volume_left) - +Number(b.volume_left);
        },
      },
      {
        type: 'number',
        name: t('orderConfig.avg_price'),
        dataIndex: 'avg_price',
        width: 120,
        sorter: buildSorter('avg_price'),
      },
      {
        type: 'string',
        name: t('orderConfig.order_status'),
        dataIndex: 'status_uname',
        width: 120,
      },
      {
        type: 'number',
        name: t('orderConfig.latency_system'),
        dataIndex: 'latency_system',
        width: 90,
        sorter: buildSorter('latency_system'),
      },
      {
        type: 'number',
        name: t('orderConfig.latency_network'),
        dataIndex: 'latency_network',
        width: 90,
        sorter: buildSorter('latency_network'),
      },
      {
        name:
          kfLocation.category == 'td'
            ? t('orderConfig.dest_uname')
            : t('orderConfig.source_uname'),
        dataIndex: kfLocation.category == 'td' ? 'dest_uname' : 'source_uname',
        sorter: buildStrSorter(
          kfLocation.category == 'td' ? 'dest_uname' : 'source_uname',
        ),
        flex: 1,
      },
      ...(isTdStrategyCategory(kfLocation.category)
        ? []
        : [
            {
              name: t('orderConfig.dest_uname'),
              dataIndex: 'dest_uname',
              sorter: buildStrSorter('dest_uname'),
              flex: 1,
            },
          ]),
      ...(isHistory
        ? []
        : [
            {
              name: '',
              dataIndex: 'actions',
              width: 60,
            },
          ]),
    ]);

export const statisColums: KfTradingDataTableHeaderConfig[] = [
  {
    name: t('tradingConfig.instrument'),
    dataIndex: 'instrumentId_exchangeId',
  },
  {
    name: '',
    dataIndex: 'sideName',
    width: 40,
  },
  {
    name: '',
    dataIndex: 'offsetName',
    width: 40,
  },
  {
    name: t('orderConfig.mean'),
    dataIndex: 'mean',
  },
  {
    name: t('orderConfig.max'),
    dataIndex: 'max',
  },
  {
    name: t('orderConfig.min'),
    dataIndex: 'min',
  },
  {
    name: `${t('orderConfig.volume')}(${t('orderConfig.completed')}/${t(
      'orderConfig.all',
    )})`,
    dataIndex: 'volume',
  },
];
