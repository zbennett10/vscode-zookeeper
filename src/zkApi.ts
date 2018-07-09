'use strict';

import * as zookeeper from 'node-zookeeper-client';
import { window, TreeItemCollapsibleState } from 'vscode';
import { ZookeeperNode } from './zookeeper-node';
import { treeProvider } from './extension';

export const client = zookeeper.createClient('localhost:2181');

client.once('connected', () => {
    console.log('Connected to Zookeeper');
    window.showInformationMessage("vscode-zookeeper successfully connected to Zookeeper at 'http://localhost:2181"); 
});

export const createNode = (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
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
    console.log(`Setting node data: ${JSON.stringify(JSON.parse(data.toString()))} at path ${path}`);
    return new Promise((resolve, reject) => {
        client.setData(path, data, (error, stat) => {
            if(error) reject(error);
            else {
                console.log(`Set data at path - ${path}. Stat is: `, stat);
                treeProvider.refresh();
                resolve(true);
            }  
        });
    });
}

export const getNodeData = (path: string): Promise<string> => {
    console.log('Getting data: ', path);
    return new Promise((resolve, reject) => {
        client.getData(path, (error, buffer) => {
            if (error) console.log(error);

            if (!buffer) {
                console.log(`There was no buffer for node at path - ${path}.`);
                resolve('');
                return;
            }

            try {
                const nodeData = JSON.parse(buffer.toString());
                console.log(`There was json data: ${JSON.stringify(nodeData)} at path - ${path}`);
                resolve(nodeData);
            } catch(e) {
                console.log(e);
                reject('');
            }
        }); 
    });
};

export const getChildren = (path: string = '/'): Promise<ZookeeperNode[]> => {
    return new Promise((resolve, reject) => {
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