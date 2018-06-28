'use strict';

import * as zookeeper from 'node-zookeeper-client';
import { window, TreeItemCollapsibleState } from 'vscode';
import { ZookeeperNode } from './zookeeper-node';
export const client = zookeeper.createClient('localhost:2181');

client.once('connected', () => {
    console.log('Connected to Zookeeper');
    window.showInformationMessage("vscode-zookeeper successfully connected to Zookeeper at 'http://localhost:2181"); 
    // client.setData('/test/config', Buffer.from(JSON.stringify({test: 'data'})), (error, stat) => {
    //     console.log(error);
    //     console.log('Data set');
    // });

    // client.getData('/test/config', (error, buffer) => {
    //     console.log(error);
    //     console.log('Data: ', JSON.parse(buffer.toString()));
    // });
});

export const createNode = (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        client.create(path, (error, returnedPath) => {
            if(error) reject(error);
            resolve(returnedPath);
        });
    });
};

export const getChildren = (path: string = '/'): Promise<ZookeeperNode[]> => {
    return new Promise((resolve, reject) => {
        client.getChildren(path, (error, children, stat) => {
            if(error) reject(error);
            console.log('Children: ', children);
            resolve(
                children.filter(child => child !== 'zookeeper')
                        .map(childName => new ZookeeperNode(childName, TreeItemCollapsibleState.Collapsed))
                );
        }); 
    });
};