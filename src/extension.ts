'use strict';

import {window, ExtensionContext} from 'vscode';
import { ZookeeperExplorerProvider } from './explorer';

export function activate(context: ExtensionContext) {
    console.log('activating');
    window.registerTreeDataProvider('zookeeperExplorer', new ZookeeperExplorerProvider());
}

export function deactivate() {

}