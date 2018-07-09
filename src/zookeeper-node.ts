import {TreeItem, TreeItemCollapsibleState, Command} from 'vscode';
import * as zk from './zkApi';

export class ZookeeperNode extends TreeItem {
    public readonly command: Command;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        private zNodeData: string = ''
    ) {
        super(label, collapsibleState);
        this.command = {
            command: 'zookeeper.viewNode',
            title: `Node: ${this.getZnodePath()}`,
            arguments: [zNodeData, this.getZnodePath()]
        };
    }

    public getZnodePath(): string {
        return this.label;
    }

    public getZnodeData(): string {
        return this.zNodeData;
    }

    getTreeItem(): TreeItem {
        let nodeData = this.getZnodeData(), nodePath = this.getZnodePath();
        return {
            label: this.label,
            collapsibleState: TreeItemCollapsibleState.None,
            command: {
                command: nodeData ? 'zookeeper.viewNode' : 'zookeeper.noOp',
                title: nodeData ? `Node: ${nodePath}` : '',
                arguments: [nodeData, nodePath]
            }
        };
    }

    async getChildren(element?: ZookeeperNode): Promise<ZookeeperNode[]> {
        return element ? zk.getChildren(element.getZnodePath()) : [];
    }
}