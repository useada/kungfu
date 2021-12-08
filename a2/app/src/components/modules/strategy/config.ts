export const columns: AntTableColumns = [
    {
        title: '策略ID',
        dataIndex: 'strategyId',
        align: 'left',
        sorter: true,
        fixed: 'left',
        width: 90,
    },
    {
        title: '状态',
        dataIndex: 'stateStatus',
        align: 'left',
        sorter: true,
        fixed: 'left',
        width: 80,
    },
    {
        title: '进程',
        dataIndex: 'processStatus',
        align: 'center',
        sorter: true,
        fixed: 'left',
        width: 60,
    },
    {
        title: '浮动盈亏',
        dataIndex: 'unrealizedPnl',
        align: 'right',
        sorter: true,
        width: 90,
    },
    {
        title: '市值',
        dataIndex: 'marketValue',
        align: 'right',
        sorter: true,
        width: 90,
    },
    {
        title: '保证金',
        dataIndex: 'margin',
        align: 'right',
        sorter: true,
        width: 90,
    },
    {
        title: '修改时间',
        dataIndex: 'addTime',
        align: 'right',
        sorter: true,
        width: 140,
    },
    {
        title: '操作',
        dataIndex: 'actions',
        align: 'right',
        width: 140,
        fixed: 'right',
    },
];
