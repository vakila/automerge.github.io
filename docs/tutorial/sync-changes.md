---
sidebar_position: 7
---
# Multi-user apps

Until now, you've built an Automerge application for a single user only. But Automerge excels when there are multiple users editing a document over time, who may or may not be online at the same time.

## BroadcastChannel

In this tutorial, we will use a [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel), which allows you to simulate a local area network. All tabs and windows on the same domain in the browser will be able to send and receive messages from each other. In a production application, you could use a WebSocket, WebRTC server, HTTP server, or simply send binary files around. 

> NOTE: BroadcastChannel is not available in IE or Safari. You must install the Safari Technical Preview or use another browser, such as Chrome, Brave, or Firefox.

Each channel has its own ID. We use the `docId`, which allows us to send messages to any other browser tab or iframe that has the ID.

```js
let docId = window.location.hash.replace(/^#/, '')
let channel = new BroadcastChannel(docId)
```

Then, we initialize the Automerge SyncState. In a production application, you'd have one sync state for each peer, but for the purposes of our tutorial, this will work for one peer at a time.

```js
let doc = Automerge.init()
let syncState = Automerge.initSyncState()
```

## Generating a sync message

Every time we change the document locally, we need to update all of our peers with the latest document state. You do this by generating a sync message:

```js
let [nextSyncState, msg] = Automerge.generateSyncMessage(doc, syncState)
```

You then send `msg` over the channel, using `channel.postMessage`. If `msg` is null, there is nothing to send.

```js
channel.postMessage(msg)
```

So, the full code is:

```js
let syncState = Automerge.initSyncState()
observer.observe(doc, (diff, before, after, local, changes) => {
    render(after)
    save(after)
    updatePeers(after)
})

function updatePeers (doc) {
    let [nextSyncState, msg] = Automerge.generateSyncMessage(doc, syncState)
    syncState = nextSyncState
    if (msg) channel.postMessage(msg)
}
```

To check to see if this worked, we need to listen to changes to see if they're being sent. The channel has an `onmessage` event, which fires every time `postMessage` is called. 

Add this to your code:

```js
channel.onmessage = (ev) => {
    let payload = ev.data
    console.log(payload)
}
```

Now, test it! Copy and paste your url into a new window so that you have two windows or tabs with the same docId. In one browser tab, add a new item. Do you see a console.log message on the other side?

## Receiving a sync message

Great, now that we are sending sync messages, we have to do something with them. Automerge provides a function `Automerge.receiveSyncMessage` which processes the message and generates a new document & sync state.

```js
let [ newDoc, newSyncState, ] = Automerge.receiveSyncMessage(doc, syncState, payload.msg)
doc = newDoc
syncState = newSyncState
```

Great, so we have a new document which we can render. You can check to see if this actually works. Since you reassign the document, the observer callback will get called and so your front-end should re-render and save the new document state.

However, we need to finish the sync process. Sync is not just a one-way update, it is a multi-party state management protocol. For example, if one side has many updates to send, not all of the updates will be sent in one single sync message. One side may have also received changes from a third party, which should be sent back. This means that every time we receive a sync message, we should generate the next sync message, until `generateSyncMessage` returns null. When generateSyncMessage returns null, that means we are all up to date.

The final resulting code looks like:

```js
channel.onmessage = function (ev) {
    let payload = ev.data

    // this message is from the same actor, ignore it
    if (payload.actorId === Automerge.getActorId(doc)) return 
    let [ newDoc, newSyncState, ] = Automerge.receiveSyncMessage(doc, syncState, payload.msg)
    doc = newDoc
    syncState = newSyncState
    // updatePeers again, until sync message is null and then we will stop
    updatePeers(doc)
}

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

Now, you should be able to add and toggle todo items on both sides and see the changes!

For more information about the sync protocol, and a more advanced example for multiple peers, see the [Cookbook](/docs/cookbook/real-time).

## Hints

Make sure you always update the global `doc` and `sycnState` with the latest versions whenever there is a new sync message.
