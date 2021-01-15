# A p2p command line chat client using Hyper Hyper Space.

This simple chat client for the command line works fully p2p.

If using from source, first run
```
yarn build
```
to compile the client.

Then use
```
yarn start
```
to begin an interactive chat session (on Windows use *yarn winstart* instead).

It uses WebRTC or WebSockets leveraging [Hyper Hyper Space](https://github.com/hyperhyperspace/hyperhyperspace-core)'s shared data layer, and it is compatible with any other client that uses the same [p2p-chat](https://github.com/hyperhyperspace/p2p-chat) (like this [web-based one](https://github.com/hyperhyperspace/p2p-chat-web)).

Chat rooms are identified by 3-word codes, that are partial hashes of the main ChatRoom object (as is customary in Hyper Hyper Space-based shared objects).

This is work in progress. The client is functional, but stateless (it forgets all info about the chat room once it is closed). If all the participants close their connections, the chat room is lost forever.