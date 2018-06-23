import {TreeItem, TreeItemCollapsibleState} from 'vscode';

export class ZookeeperNode {
    readonly label: string;

    protected constructor(label: string) {
        this.label = label;
    }

    getTreeItem(): TreeItem {
        return {
            label: this.label,
            collapsibleState: TreeItemCollapsibleState.None
        };
    }

    async getChildren(element?: ZookeeperNode): Promise<ZookeeperNode[]> {
        return [];
    }
}