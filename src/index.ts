import '@hyper-hyper-space/node-env';

import { ChatRoom, ChatMessage } from '@hyper-hyper-space/p2p-chat';

import { Identity, RSAKeyPair, Space, Resources, HashedLiteral } from '@hyper-hyper-space/core';



import * as readline from 'readline';
//import { StateGossipAgent, PeerGroupAgent, ObjectDiscoveryAgent, NetworkAgent, ObjectBroadcastAgent } from '@hyper-hyper-space/core';

async function initResources(): Promise<Resources> {
    return Resources.create();
}

async function createIdentity(resources: Resources, name: string): Promise<Identity> {
    console.log();
    console.log('Generating RSA key for ' + name + '...');
    let key = await RSAKeyPair.generate(1024);
    console.log('Done.');
    let id = Identity.fromKeyPair({name: name}, key);

    
    await resources.store.save(key);
    await resources.store.save(id);

    resources.config.id = id;

    return id;
}

async function createChatRoomSpace(resources: Resources, topic?: string): Promise<Space> {

    let chatRoom = new ChatRoom();

    let space = Space.fromEntryPoint(chatRoom, resources);

    space.startBroadcast();
    let room = await space.getEntryPoint() as ChatRoom;

    if (topic !== undefined) {
        await room.topic?.setValue(new HashedLiteral(topic));
    }
    
    await resources.store.save(room);

    room.setResources(resources);
    room.startSync();

    console.log();
    console.log('Created chat room, wordcode is:');
    console.log();
    console.log((await space.getWordCoding()).join(' '));
    console.log();

    return space;
}

async function joinChatRoomSpace(resources: Resources, wordcode: string[]): Promise<Space> {
    
    let space = Space.fromWordCode(wordcode, resources);

    console.log();
    console.log('Trying to join chat with word code "' + wordcode.join(' ') + '"...');
    await space.entryPoint;
    console.log('Done.');
    console.log();

    space.startBroadcast();
    let room = await space.getEntryPoint() as ChatRoom;

    await resources.store.save(room);

    room.setResources(resources);
    room.startSync();

    return space;
}


async function main() {

    //StateGossipAgent.controlLog.level = 0;
    //StateGossipAgent.peerMessageLog.level = 0;

    //PeerGroupAgent.controlLog.level = 0;

    //ObjectBroadcastAgent.log.level = 0;
    //ObjectDiscoveryAgent.log.level = 0;

    //NetworkAgent.logger.level = 0;
    //NetworkAgent.connLogger.level = 0;


    let resources = await initResources();

    let nonInteractive = false;
    let rl: readline.Interface;
    let name: string;
    let wordcodeOrBlank: string;

    if (process.argv.length > 2) {
        nonInteractive = true;
        name = '';
        wordcodeOrBlank = process.argv[2] + ' ' + process.argv[3] + ' ' + process.argv[4];
        console.log('starting in non-interactive mode for wordcode: ' + wordcodeOrBlank);
    } else {
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    
        console.log();
        
        name = await new Promise((resolve: (name: string) => void/*, reject: (reason: any) => void*/) => {
            rl.question('Enter your name: ', (name: string) => {
                resolve(name);
            });
        });
    
        console.log();
        console.log('Press enter to create a chat room, or input the 3 code words to join an existing one.');
        console.log();
    
        wordcodeOrBlank = await new Promise((resolve: (text: string) => void/*, reject: (reason: any) => void*/) => {
            rl.question('>', (command: string) => {
                resolve(command);
            });
        });
    }



    let id = await createIdentity(resources, name);

    let space: Space;
    if (wordcodeOrBlank.trim() === '') {

        space = await createChatRoomSpace(resources, '');

    } else {

        let wordcode: string[] = wordcodeOrBlank.split(' ');

        if (wordcode.length !== 3) {
            console.log('expected 3 words, like: pineapple greatness flurry');
            console.log('cannot join chat, exiting.');
            process.exit();
        }

        space = await joinChatRoomSpace(resources, wordcode);
    }

    let room = await space.getEntryPoint() as ChatRoom;


    if (!nonInteractive) {
        room.messages?.onAddition((m: ChatMessage) => {
            console.log(m.getAuthor()?.info?.name + ': ' + m.text);
        });
    }



    room.messages?.loadAndWatchForChanges();
    room.topic?.loadAndWatchForChanges();

    if (!nonInteractive) {
        console.log('Type and press return to send a message!')
        console.log();
    
        while (true) {
            let text = await new Promise((resolve: (text: string) => void/*, reject: (reason: any) => void*/) => {
                rl.question('', (name: string) => {
                    resolve(name);
                });
            });
        
            room.say(id, text);
        }
    }


    
}

main();