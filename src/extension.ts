'use strict';

import { window, ExtensionContext } from 'vscode';
import ZookeeperExplorerProvider from './explorer';
import * as zk from './zkApi';


var treeProvider = new ZookeeperExplorerProvider();

export function activate(context: ExtensionContext) {
    window.registerTreeDataProvider('zookeeperExplorer', treeProvider);
    console.log('vscode-zookeeper: Attempting to connect to Zookeeper');
    zk.client.connect();
}

export function deactivate() {

}