'use strict';

import { window, commands, ExtensionContext, ViewColumn } from 'vscode';
import ZookeeperExplorerProvider from './explorer';
import * as zk from './zkApi';


export const treeProvider = new ZookeeperExplorerProvider();

export function activate(context: ExtensionContext) {
    console.log('vscode-zookeeper: Attempting to connect to Zookeeper');
    zk.client.connect();

    window.registerTreeDataProvider('zookeeperExplorer', treeProvider);

    context.subscriptions.push(commands.registerCommand('zookeeper.editNodeData', (nodeData) => {
        zk.setNodeData('/test/config', Buffer.from(nodeData));
    }));

    context.subscriptions.push(commands.registerCommand('zookeeper.viewNode', (nodeData, path) => {
        // Create and show a new webview
        const panel = window.createWebviewPanel(
            'zookeeper', // Identifies the type of the webview. Used internally
            `ZNode - ${path}`, // Title of the panel displayed to the user
            ViewColumn.One, // Editor column to show the new webview panel in.
            { enableScripts: true } // Webview options. More on these later.
        );

        // wire up message passing
        panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'zookeeper.editNodeData':
                    commands.executeCommand('zookeeper.editNodeData', message.text);
                    return;
            }
        }, undefined, context.subscriptions);

        panel.webview.html =  `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ZNode</title>
        </head>
        <body>
            <textarea id="NodeData">${JSON.stringify(nodeData)}</textarea>
            <button id="Save">Save</button>
            <script>
                const vscode = acquireVsCodeApi();
                const saveBtn = document.querySelector('#Save');

                saveBtn.addEventListener('click', (e) => {
                    const nodeData = document.querySelector('#NodeData').value;
                    vscode.postMessage({
                        command: 'zookeeper.editNodeData',
                        text: nodeData
                    });
                });
            </script>
        </body>
        </html>`;
    }));
}

export function deactivate() {

}