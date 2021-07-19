import { deleteStrategy, getStrategyById } from '__io/kungfu/strategy';
import { removeFileFolder } from '__gUtils/fileUtils';
import { deleteProcess, startStrategy } from '__gUtils/processUtils';
import { STRATEGY_DIR, buildProcessLogPath } from '__gConfig/pathConfig';

const path = require('path');

//删除策略
export const deleteStrat = (strategyId: string): Promise<any> => {
    return deleteStrategy(strategyId) //删除策略数据库
    .then(() => removeFileFolder(path.join(STRATEGY_DIR, strategyId))) //策略相关数据
    .then(() => removeFileFolder(buildProcessLogPath(strategyId)))//策略log
    .then(() => deleteProcess(strategyId))
    .catch((err: Error) => console.error(err))
}


export const switchStrategy = (strategyId: string, value: boolean): Promise<MessageData> => {
    if(!value){
        return deleteProcess(strategyId)
        .then((): MessageData => ({ type: 'success', message: '操作成功！' }))       
        .catch((err: Error): MessageData => ({ type: 'error', message: err.message || '操作失败！' }))
    }

    // for import file changed in code editor module
    return getStrategyById(strategyId).then((curStrategy: any): Promise<MessageData> => {
        const notExistMessage: MessageData = { type: 'error', message: `${strategyId} is not existed!` }
        if(!curStrategy.length) return new Promise(resolve => resolve(notExistMessage)); 
        const strategyPath = curStrategy[0].strategy_path;
        const noStrategyPath: MessageData = { type: 'error', message: `该策略未绑定任何文件！` }
        if(!strategyPath) return new Promise(resolve => resolve(noStrategyPath))
        return startStrategy(strategyId, strategyPath)// 启动策略
        .then((): MessageData => ({ type: 'start', message: '正在启动...' }))       
    })
}