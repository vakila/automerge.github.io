---
sidebar_position: 7
---
# Multi-user apps

Until now, you've built an Automerge application for a single user only. Are you ready to add multi-user collaboration?

In this tutorial, we will use a [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel), which allows you to simulate a local area network. All tabs and windows on the same domain in the browser will be able to send and receive messages from each other. In a production application, you could use a WebSocket, WebRTC server, HTTP server, or simply send binary files around. 

> NOTE: BroadcastChannel is not available in IE or Safari. You must install the Safari Technical Preview or use another browser, such as Chrome, Brave, or Firefox.

```js
let docId = window.location.hash
let channel = new BroadcastChannel(docId)
```

```js
channel.onmessage = function (ev) {
    let payload = ev.data

    // this message is from the same actor, ignore it
    if (payload.actorId === Automerge.getActorId(doc)) return 
    let [ newDoc, newSyncState,  ] = Automerge.receiveSyncMessage(doc, syncState, payload.msg)
    doc = newDoc
    syncState = newSyncState
    updatePeers(doc)
    save(doc)
}

// typically, you'd have one sync state for each peer
let syncState = Automerge.initSyncState()

function updatePeers (doc) {
    let actorId = Automerge.getActorId(doc)
    let [nextSyncState, msg] = Automerge.generateSyncMessage(
        doc, 
        syncState
    )
    syncState = nextSyncState
    if (msg) {
        channel.postMessage({
            actorId,
            msg: msg
        })
    }
}
```

For more information about the sync protocol, and a more advanced example for multiple peers, see the [Cookbook](docs/cookbook/real-time).