'use strict';

import * as zookeeper from 'node-zookeeper-client';
import { window, TreeItemCollapsibleState } from 'vscode';
import { ZookeeperNode } from './zookeeper-node';
import { treeProvider } from './extension';

const createDefaultConnection = (): zookeeper.Client => {
    let defaultConnection = zookeeper.createClient('localhost:2181');
    console.log('default: ', defaultConnection);
    defaultConnection.once('connected', () => {
        console.log('[VSCode-Zookeeper]: Connected to Zookeeper');
        window.showInformationMessage("vscode-zookeeper successfully connected to Zookeeper at 'http://localhost:2181"); 
    });
    return defaultConnection;
};

export let client = createDefaultConnection();

export const disconnect = () => {
    if(client) {
        client.on('disconnected', () => {
            window.showInformationMessage('Successfully disconnected from Zookeeper.');
        });
        client.close();
    }
};

export const createNewConnection = (host: string): void => {
    if(client) client.close();
    let connectionTimer = setTimeout(() => {
        window.showErrorMessage(`Unable to connect to Zookeeper at host: ${host}`);
    }, 8000);

    console.log('creating new connection: ', host);
    let newConnection = zookeeper.createClient(host);
    newConnection.connect();
    newConnection.once('connected', () => {
        console.log('[VSCode-Zookeeper]: Zookeeper connected to new host');
        client = newConnection;
        clearTimeout(connectionTimer);
        treeProvider.refresh();
        window.showInformationMessage(`vscode-zookeeper successfully connected to Zookeeper at ${host}`); 
    });
};

export const createNode = (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!path)  {
            reject(new Error('[VSCode Zookeeper]: Path is required.'));
            window.showErrorMessage('A path is required to create zookeeper node');
        }

        // Add the required forward-slash if none is given
        if (path && path[0] !== '/') path = '/' + path;

        client.create(path, (error, returnedPath) => {
            if(error) {
                reject(error);
                window.showErrorMessage(`Unable to create zookeeper node at path: ${path}`);
            }
            treeProvider.refresh();
            resolve(returnedPath);
        });
    });
};

export const deleteNode = (path: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        if (!path)  {
            reject(new Error('[VSCode Zookeeper]: Path is required.'));
            window.showErrorMessage('A path is required to delete a zookeeper node');
        }

        // Add the required forward-slash if none is given
        if (path && path[0] !== '/') path = '/' + path;

        client.remove(path, (error) => {
            if(error) {
                reject(error);
                window.showErrorMessage(`Unable to delete zookeeper node at path: ${path}`);
            }
            treeProvider.refresh();
            resolve(true);
        });
    });
};

export const setNodeData = (path: string, data: Buffer): Promise<Boolean> => {
    return new Promise((resolve, reject) => {
        if (!path)  {
            reject(new Error('[VSCode Zookeeper]: Path is required.'));
            window.showErrorMessage('A path is required to edit a zookeeper node');
        }

        // Add the required forward-slash if none is given
        if (path && path[0] !== '/') path = '/' + path;

        client.setData(path, data, (error, stat) => {
            if(error) reject(error);
            else {
                treeProvider.refresh();
                resolve(true);
            }  
        });
    });
}

export const getNodeData = (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!path)  {
            reject(new Error('[VSCode Zookeeper]: Path is required.'));
            window.showErrorMessage('A path is required to edit a zookeeper node');
        }

        // Add the required forward-slash if none is given
        if (path && path[0] !== '/') path = '/' + path;

        client.getData(path, (error, buffer) => {
            if (error) console.log(error);

            if (!buffer) {
                console.log(`There was no buffer for node at path - ${path}.`);
                resolve('');
                return;
            }

            try {
                resolve(buffer.toString());
            } catch(e) {
                console.log(e);
                reject('');
            }
        }); 
    });
};

export const getChildren = (path: string = '/'): Promise<ZookeeperNode[]> => {
    return new Promise((resolve, reject) => {
        // Add the required forward-slash if none is given
        if (path && path[0] !== '/') path = '/' + path;

        client.getChildren(path, (error, children, stat) => {
            if(error) reject(error);
            Promise.all(children.filter(child => child !== 'zookeeper')
                        .map(async childName => {
                            let qualifiedPath = `${path !== '/' ? path : ''}/${childName}`;
                            let data = await getNodeData(qualifiedPath);
                            return new ZookeeperNode(qualifiedPath, TreeItemCollapsibleState.Collapsed, data);
                        }))
                        .then(children => resolve(children));
        }); 
    });
};
