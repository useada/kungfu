import { KF_TICKER_SET_JSON_PATH } from '@kungfu-trader/kungfu-uicc/config/pathConfig';
import fse from 'fs-extra';

export const getTickerSetsJSON = (): Promise<stringToTickerSet> => {
    return fse.readFile(KF_TICKER_SET_JSON_PATH)
        .then(res => {
            const str = Buffer.from(res).toString();
            return JSON.parse(str || '{}')
        })
}

export const getTickerSets = (): Promise<readonly TickerSet[]> => {
    return getTickerSetsJSON()
        .then(res => {
            return Object.freeze(Object.values(res).map((item: TickerSet) => Object.freeze(item)))
        })
}

export const addSetTickerSet = async (tickerSet: TickerSet) => {
    const tickerSetsJSON: stringToTickerSet = await getTickerSetsJSON();
    const name = tickerSet.name;
    if (!name) {
        throw new Error('No name in a tickerSet!')
    }
    tickerSetsJSON[name] = tickerSet;
    return fse.outputJson(KF_TICKER_SET_JSON_PATH, tickerSetsJSON)
}

export const removeTickerSetByName = async (targetName: string) => {
    const tickerSetsJSON: stringToTickerSet = await getTickerSetsJSON();
    if (tickerSetsJSON[targetName]) {
        delete tickerSetsJSON[targetName]
    }
    return fse.outputJson(KF_TICKER_SET_JSON_PATH, tickerSetsJSON)
}