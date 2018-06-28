import {TreeDataProvider, TreeItem, EventEmitter, Event} from 'vscode';
import { ZookeeperNode } from './zookeeper-node';
import * as zk from './zkApi';

export default class ZookeeperExplorerProvider implements TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: EventEmitter<ZookeeperNode | undefined> = new EventEmitter<ZookeeperNode | undefined>();
	readonly onDidChangeTreeData: Event<ZookeeperNode | undefined> = this._onDidChangeTreeData.event;

    constructor() {}

    refresh(): void {
		this._onDidChangeTreeData.fire();
	}
    
    getTreeItem(element: ZookeeperNode): TreeItem {
        return element;
    }

    async getChildren(element?: ZookeeperNode): Promise<ZookeeperNode[]> {
        if (element) {
            return element.getChildren(element);
        } else {
            return zk.getChildren();
        }
    }
}