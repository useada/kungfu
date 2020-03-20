import posTable from '@/assets/components/PosTable';
import orderTable from '@/assets/components/OrderTable';
import tradeTable from '@/assets/components/TradeTable';
import Dashboard from '@/assets/components/Dashboard';
import MessageBox from '@/assets/components/MessageBox';

import { parseToString, TABLE_BASE_OPTIONS, DEFAULT_PADDING, dealNum } from '@/assets/scripts/utils';
import { tradingDataObservale, processListObservable, switchProcess } from '@/assets/scripts/actions';
// import { nanoCancelAllOrder } from '__io/nano/nanoReq';
import { throttleInsert } from '__gUtils/busiUtils';

const blessed = require('blessed');

// 定义全局变量
const WIDTH_LEFT_PANEL = 60;

class TradingDataDashboard extends Dashboard {
	targetId: string;
	type: string
	screen: any;
	globalData: {
		processList: ProcessListItem[];
	};
	boards: any;

	constructor(targetId: string, type: string){
		super()
		this.screen.title = type === 'account' ? 'Account Dashboard' : 'Strategy Dashboard';
		this.targetId = targetId;
		this.type = type;
		this.globalData = {
			processList: []
		};

		this.boards = {};
		this.init()

	}

	init(){
		const t = this;
		t.initProcessTable();
		t.initAssetsTable();
		t.initPosTable();
		t.initOrderList();
		t.initTradeList();
		t.initBoxInfo();
		t.initMessage();
		t.initCancelOrderBtn();
		t.screen.render();
		t.bindEvent();
		t.bindData();
	}
	
	initProcessTable(){
		const t = this;
		t.boards.processTable = blessed.list({
            ...TABLE_BASE_OPTIONS,
            label: t.type === 'account' ? ' Account Trading Engines (Td/Md) ' : ' Strategy Trading Engines ',
            parent: t.screen,
            padding: DEFAULT_PADDING,
            top: '0',
            left: '0',
            interactive: true,
			mouse: false,			
            width: 45,
            height: '40%',
            style: {
                ...TABLE_BASE_OPTIONS.style,
                selected: {
					bold: true,
					bg: 'blue',
                }
            }
        })
        t.boards.processTable.focus()
	}

	initAssetsTable(){
		const t = this;
		t.boards.assetTable = blessed.list({
            ...TABLE_BASE_OPTIONS,
            label: ' Assets ',
            parent: t.screen,
            padding: DEFAULT_PADDING,
            top: 0,
            left: 45,
            interactive: true,
			mouse: true,			
            width: 100 - WIDTH_LEFT_PANEL + 5 + '%-45',
            height: '40%-3',
            style: {
                ...TABLE_BASE_OPTIONS.style,
                selected: {
					bold: true,
                }
            }
        })
	}

	initCancelOrderBtn() {
		const t = this;
		t.boards.cancelBtn = blessed.button({
			content: 'Cancel All Order',
            parent: t.screen,
			width: 100 - WIDTH_LEFT_PANEL + 5 + '%-45',
            height: 3,
            left: 45,
			top: '40%-3',
			align: 'center',
			valign: 'middle',
            interactive: true,
			mouse: true,
			border: 'line',
			style: {
				fg: 'white',
				bg: 'red',
				border: {
					fg: 'white',
				},
				focus: {
					border: {
						fg: 'red',
					}
				},
            }
		})
		t.boards.cancelBtn.setIndex(999)
	}
	
	initPosTable(){
		const t = this;
		t.boards.posTable = posTable()
		t.boards.posTable.build({
			label: ' Positions ',
			parent: t.screen,
			top: '0',
			left: 100 - WIDTH_LEFT_PANEL + 5 + '%',
			width: WIDTH_LEFT_PANEL - 5 + '%',
			height: '40%',
		})
	}
	
	initOrderList(){
		const t = this;
		t.boards.orderTable = orderTable(t.type)
		t.boards.orderTable.build({
			label: ' Orders Records (3days)',
			parent: t.screen,
			top: '40%',
			width: WIDTH_LEFT_PANEL - 5 + '%',
			height: '55%'
		});
	}
	
	initTradeList(){
		const t = this;
		t.boards.tradeTable = tradeTable(t.type)
		t.boards.tradeTable.build({
			label: ' Trades Records (3days)',
			parent: t.screen,
			top: '40%',
			left: WIDTH_LEFT_PANEL - 5 + '%',
			width: 100 - WIDTH_LEFT_PANEL + 5 + '%',
			height: '55%'
		});
	}
	
	initBoxInfo() {
		const t = this;
		t.boards.boxInfo = blessed.text({
			content: ' left/right: switch boards | up/down/mouse: scroll | Ctrl/Cmd-C: exit | Enter: start/stop process',
			parent: t.screen,		
			left: '0%',
			top: '95%',
			width: '100%',
			height: '6%',
			valign: 'middle',
			tags: true
		});	
	}

	initMessage(){
        const t = this;
        t.boards.message = MessageBox(t.screen);
    }
	
	bindEvent() {
		const t = this;
		let i = 0;
		let boards = ['processTable', 'assetTable', 'cancelBtn', 'posTable', 'orderTable', 'tradeTable'];
		t.screen.key(['left', 'right'], (ch: any, key: any) => {
			(key.name === 'left') ? i-- : i++;
			if (i === 6) i = 0;
			if (i === -1) i = 5;
			t.boards[boards[i]].focus();
		});
	
		t.screen.key(['escape', 'q', 'C-c'], function(ch: any, key: any) {
			t.screen.destroy();
			process.exit(0);
		});	

		t.boards.processTable.key(['enter'], () => {
			const selectedIndex: number = t.boards.processTable.selected;
            switchProcess(t.globalData.processList[selectedIndex], t.boards.message)
		});
		
		t.boards.cancelBtn.on('press', () => {
			// nanoCancelAllOrder({
			// 	cancelType: t.type, 
			// 	id: t.targetId
			// })
			// .then(() => t.boards.message.log('Is cancelling orders, please wait...'))
			// .catch((err: Error) => {
			// 	t.boards.message.log(err.message)
			// })
		})
	}


	bindData() {
		const t = this;
		const orderThrottle = throttleInsert(1000);
		const tradeThrottle = throttleInsert(1000);
		tradingDataObservale(t.type, t.targetId).subscribe((tradingData: any) => {
			const type = tradingData[0];
			const data = tradingData[1];

			switch (type) {
				case 'orderList':
					t.boards.orderTable.setItems(data)
					t.screen.render();
					break;
				case 'order':
					orderThrottle(data).then((dataList: OrderData[]) => {
						if(!dataList.length) return;
						t.boards.orderTable.setItems(dataList)
						t.screen.render();
					})
					break;
				case 'tradeList':
					t.boards.tradeTable.setItems(data)
					t.screen.render();
					break;
				case 'trade':
					tradeThrottle(data).then((dataList: TradeData[]) => {
						if(!dataList.length) return;
						t.boards.tradeTable.setItems(dataList)
						t.screen.render();					
					})
					break;
				case 'pos':
					t.boards.posTable.setItems(data);
					t.screen.render();
					break;
				case 'asset':
					const assetData = Object.entries(data)
						.map((kvPair: any[]) => {
							let key = kvPair[0]
							let val = kvPair[1]
							let theFirst = key[0]
							key = theFirst.toUpperCase() + key.slice(1)
							if(['UnRealizedPnl', 'RealizedPnl'].includes(key)) {
								val = dealNum(+val)
							}
							return parseToString(
								[key, val],
								[16, 16]
							)
						})
					t.boards.assetTable.setItems(assetData)
					t.screen.render();
					break
			}
		})

		processListObservable().subscribe((processList: any) => {
			const t = this;
			if(t.type === 'account') {
				processList = processList
					.filter((proc: ProcessListItem) => {
						if((proc.type === 'td') && (proc.account_id === t.targetId)) return true;
						else if((proc.type === 'md') && (t.targetId.includes(proc.source_name))) return true
						else if(proc.type === 'main') return true
						else return false
					})
			} else if (t.type === 'strategy') {
				processList = processList
					.filter((proc: ProcessListItem) => {
						if(proc.type === 'strategy' && proc.strategy_id === t.targetId) return true
						else if(proc.type === 'main') return true
						else return false
					})
			}

			t.globalData.processList = processList;
			const processListResolve = processList
                .map((proc: ProcessListItem) => parseToString([
                    proc.typeName,
                    proc.processName,
                    proc.statusName
                ], [5, 15, 8]))
            t.boards.processTable.setItems(processListResolve);
            t.screen.render();
        })
	}
}
	


export default (targetId: string, type: string) => new TradingDataDashboard(targetId, type)



