'use strict';

import * as zookeeper from 'node-zookeeper-client';
import { window, ExtensionContext } from 'vscode';
import ZookeeperExplorerProvider from './explorer';

var zkClient = zookeeper.createClient('localhost:2181');

zkClient.once('connected', () => {
    console.log('Connected to Zookeeper');

    zkClient.transaction()
            .create('/test/config')
            .check('/test/config')
            .commit((error, results) => {
                if (error) console.log(error);
                console.log('results: ', results);
                zkClient.close();
            });
}); 

export function activate(context: ExtensionContext) {
    window.registerTreeDataProvider('zookeeperExplorer', new ZookeeperExplorerProvider());
    console.log('vscode-zookeeper: Attempting to connect to Zookeeper');
    zkClient.connect();
}

export function deactivate() {

}