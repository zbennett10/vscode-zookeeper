'use strict';

import { window, commands, ExtensionContext, ViewColumn } from 'vscode';
import ZookeeperExplorerProvider from './explorer';
import * as zk from './zkApi';


var treeProvider = new ZookeeperExplorerProvider();

export function activate(context: ExtensionContext) {
    console.log('vscode-zookeeper: Attempting to connect to Zookeeper');
    zk.client.connect();

    window.registerTreeDataProvider('zookeeperExplorer', treeProvider);
    context.subscriptions.push(commands.registerCommand('zookeeper.viewNode', (nodeData) => {
        // Create and show a new webview
        const panel = window.createWebviewPanel(
            'zookeeper', // Identifies the type of the webview. Used internally
            "ZNode Data", // Title of the panel displayed to the user
            ViewColumn.One, // Editor column to show the new webview panel in.
            { } // Webview options. More on these later.
        );
        panel.webview.html =  `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cat Coding</title>
        </head>
        <body>
            <textarea>${JSON.stringify(nodeData)}</textarea>
        </body>
        </html>`;
        console.log('panel: ', panel, ' created..');
    }));
}

export function deactivate() {

}