import {TreeItem, TreeItemCollapsibleState} from 'vscode';
import * as zk from './zkApi';

export class ZookeeperNode extends TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }

    public getZnodePath(): string {
        return `/${this.label}`;
    }

    getTreeItem(): TreeItem {
        return {
            label: this.label,
            collapsibleState: TreeItemCollapsibleState.None
        };
    }

    async getChildren(element?: ZookeeperNode): Promise<ZookeeperNode[]> {
        return element ? zk.getChildren(element.getZnodePath()) : [];
    }
}