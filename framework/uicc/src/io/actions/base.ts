import fse from 'fs-extra';
import { startCustomProcess, deleteProcess, killKfc, killGodDaemon, killKungfu, killExtra, startMaster, startLedger, startDaemon, startTask, stopProcess } from '@kungfu-trader/kungfu-uicc/utils/processUtils';
import { delayMilliSeconds } from '@kungfu-trader/kungfu-uicc/utils/busiUtils';
import { buildCustomProcessConfig } from '@kungfu-trader/kungfu-uicc/config/systemConfig';
import { KF_TARADING_CONFIG_PATH, KF_CONFIG_PATH } from '@kungfu-trader/kungfu-uicc/config/pathConfig';

export const switchMaster = async (status: boolean): Promise<any> => {
    if(!status){
        try {
            await deleteProcess('master');
            await killKfc()
            await killExtra();
            await killGodDaemon();
            if (process.env.NODE_ENV === "production") {
                await killKungfu();
            }
        } catch(err) {
            throw err
        }
    } else {
        try {
            await startMaster(false)
            await delayMilliSeconds(1000)
            await startLedger(false)
        } catch (err) {
            throw err
        } 
    } 
}
   

export const switchLedger = (status: boolean): Promise<any> => {
    if (!status) return deleteProcess('ledger')   
    return startLedger(false)
}

export const switchDaemon = (status: boolean): Promise<any> => {
    if (!status) return deleteProcess('kungfuDaemon');
    return startDaemon()
}

export const switchCustomProcess = (status: boolean, targetName: string) => {
    if (!status) return deleteProcess(targetName)

    const customProcessConfig = buildCustomProcessConfig();
    const targetProcessConfig = customProcessConfig[targetName];
    if(!targetProcessConfig) throw new Error(`No ${targetName} in systemConfig systemTradingConfig or extensionConfig`)
    const kfSystemConfig = fse.readJsonSync(KF_CONFIG_PATH) || {};
    const kfSystemTradingConfig = fse.readJsonSync(KF_TARADING_CONFIG_PATH) || {};
    const systemConfigValData: any = {
        ...kfSystemConfig,
        ...kfSystemTradingConfig
    }
    const args = targetProcessConfig.args;
    const parentKey = targetProcessConfig.parentKey;
    const processValData = systemConfigValData[parentKey];

    const params = args
        .map((arg: SystemConfigChildArgsItemData): string => {
            const key = arg.key;
            const valueKey = arg.value;
            return `${key} ${processValData[valueKey]}`;
        });
        
    return startCustomProcess(targetName, params.join(' '))
}


export const switchTask = (status: Boolean, options: Pm2Options) => {
    if (!status) return stopProcess(options.name)
    return startTask(options)

}