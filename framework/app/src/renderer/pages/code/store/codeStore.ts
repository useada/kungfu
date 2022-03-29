import { defineStore } from 'pinia';
import fse from 'fs-extra';

import { KF_CONFIG_PATH } from '@kungfu-trader/kungfu-js-api/config/pathConfig';
import { deepClone } from '@kungfu-trader/kungfu-js-api/utils/busiUtils';
import { getAllKfConfigOriginData } from '@kungfu-trader/kungfu-js-api/actions';
// import { KfCategoryTypes } from '@kungfu-trader/kungfu-js-api/typings/enums';
interface ICodeState {
  currentStrategy: string;
  strategyList: KungfuApi.KfConfig[];
  currentFile: Code.FileData;
  entryFile: Code.FileData;
  fileTree: Code.IFileTree;
  kfConfig: Record<string, Record<string, KungfuApi.KfConfigValue>>;
}

export const useCodeStore = defineStore('code', {
  state: (): ICodeState => {
    return {
      currentStrategy: '', //当前运行策略
      strategyList: [], //策略列表
      currentFile: {} as Code.FileData, //文件树高亮
      entryFile: {} as Code.FileData, //入口文件
      fileTree: {}, //文件树
      kfConfig: {}, // kf 配置
    };
  },
  actions: {
    //设置当前策略
    setCurrentStrategy(strategy): void {
      this.currentStrategy = strategy;
    },

    setStrategyList(): Promise<void> {
      return getAllKfConfigOriginData().then((res) => {
        const { strategy } = res;
        this.strategyList = strategy;
      });
    },

    //策略编辑，设置当前文件
    setCurrentFile(file): void {
      this.currentFile = file;
    },

    //策略编辑，设置文件树
    setFileTree(fileTree): void {
      this.fileTree = fileTree;
    },

    //策略编辑，设置文件节点
    setFileNode({ id, attr, val }): void {
      const fileTree = this.fileTree;
      const node = deepClone(fileTree[id]);
      node[attr] = val;
      this.fileTree[id] = node;
    },

    //策略编辑，添加文件或文件夹时，添加“pending”
    addFileFolderPending({ id, type }): void {
      const targetChildren = this.fileTree[id].children;
      if (type == 'folder') {
        targetChildren['folder'].unshift('pending');
      } else {
        targetChildren['file'].unshift('pending');
      }
      this.fileTree[id]['children'] = targetChildren;
      this.fileTree['pending']['parentId'] = id;
    },

    //策略编辑时，添加文件或文件夹时，删除“pending”
    removeFileFolderPending({ id, type }): void {
      const targetChildren = this.fileTree[id].children;
      if (type == 'folder') {
        targetChildren['folder'].splice(
          targetChildren['folder'].indexOf('pending'),
          1,
        );
      } else {
        targetChildren['file'].splice(
          targetChildren['file'].indexOf('pending'),
          1,
        );
      }
      this.fileTree[id]['children'] = targetChildren;
      this.fileTree['pending']['parentId'] = '';
    },

    //标记入口文件
    setEntryFile(entryFile): void {
      this.entryFile = entryFile;
    },

    async getKungfuConfig(): Promise<void> {
      const kfConfig = fse.readJsonSync(KF_CONFIG_PATH);
      await this.setKungfuConfig(kfConfig);
    },

    setKungfuConfig(kfConfig): void {
      Object.keys(kfConfig || {}).forEach((key) => {
        this.kfConfig[key] = kfConfig[key];
      });
    },

    setKungfuConfigByKeys(kfConfig): void {
      Object.keys(kfConfig || {}).forEach((key) => {
        this.kfConfig[key] = kfConfig[key];
      });
      fse.outputJsonSync(KF_CONFIG_PATH, {
        ...this.kfConfig,
        ...kfConfig,
      });
    },
  },
});
