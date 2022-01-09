---
sidebar_position: 2
---  

# Real-time Collaboration

The Automerge library itself is agnostic to the network layer — that is, you can use whatever
communication mechanism you like to get changes from one node to another. There are currently a few
options, with more under development:

- Use `Automerge.getChanges()` and `Automerge.applyChanges()` to manually capture changes on one
  node and apply them on another. These changes are encoded as byte arrays (`Uint8Array`). You can
  also store a log of these changes on disk in order to persist them.
- Use `Automerge.generateSyncMessage()` to generate messages, send them over any transport protocol
  (e.g. WebSocket), and call `Automerge.receiveSyncMessage()` on the recipient to process the
  messages. 

## Changes interface

The `getChanges()/applyChanges()` API works as follows:

```js
// On one node
let newDoc = Automerge.change(currentDoc, doc => {
  // make arbitrary change to the document
})
let changes = Automerge.getChanges(currentDoc, newDoc)
// broadcast changes as a byte array
network.broadcast(changes)
// On another node, receive the byte array
let changes = network.receive()
let [newDoc, patch] = Automerge.applyChanges(currentDoc, changes)
// `patch` is a description of the changes that were applied (a kind of diff)
```

Note that `Automerge.getChanges(oldDoc, newDoc)` takes two documents as arguments: an old state and
a new state. It then returns a list of all the changes that were made in `newDoc` since `oldDoc`.

The counterpart, `Automerge.applyChanges(oldDoc, changes)` applies the list of `changes` to the
given document, and returns a new document with those changes applied. Automerge guarantees that
whenever any two documents have applied the same set of changes — even if the changes were applied
in a different order — then those two documents are equal. That property is called _convergence_,
and it is the essence of what Automerge is all about.

`Automerge.merge(doc1, doc2)` is a related function that is useful for testing. It looks for any
changes that appear in `doc2` but not in `doc1`, and applies them to `doc1`, returning an updated
version of `doc1`. This function requires that `doc1` and `doc2` have different actor IDs (that is,
they originated from different calls to `Automerge.init()`).

## Sync protocol

In the case that document history is quite large, and two devices are online at the same time, we want to only send the subset of changes that are relevant. The Automerge sync protocol is designed to help with this process. The Automerge sync protocol brings two documents into sync by exchanging messages between peers until both documents have the same contents. The protocol can run on top of any connection-based network link that supports bidirectional messages, including WebSocket, WebRTC, or plain TCP. It can be used in any network topology: client/server, peer-to-peer, or server-to-server sync are all supported.

The protocol works by exchanging rounds of sync messages. These sync messages contain two parts: 
 * a lossily-compressed list of changes it already has (implicitly requesting the remainder)
 * changes it believe the other peer needs

On connection, each peer should start the exchange with an initial message via `generateSyncMessage(doc, syncState)`. This first message generally does not include changes, but provides the recipient with the information it needs to determine which changes it should send. Upon receiving any message, a peer should always call `receiveSyncMessage(doc, syncState, message)`. This will update the `syncState` with the information necessary to calculate what changes to send, and also cause Automerge to apply any changes it received. The developer can now call `generateSyncMessage(doc, syncState)` to produce the next message to a peer. 

From then on, a peer should continue to call these functions until `generateSyncMessage()` returns a `null` value, indicating both peers are synchronized and no further communication is necessary.

Here are a few demos that you can use if you'd prefer to see a full working implementation. 

* https://github.com/pvh/automerge-demo/ uses Svelte and BroadcastChannel for the network.
* https://github.com/okdistribute/automerge-chat-demo uses React and Websockets for the network.

Read below for a step-by-step walkthrough.


**Example**

Automerge synchronization occurs at a per-document level. Most Automerge-based applications will be built around more than one document, so in our example code here we will assume these documents are identified by a string `docId`.

Throughout the example code below we're going to assume a couple of global variables exist, described here:

```js
// global variables (but maybe don't use global variables)
const syncStates = {} // a hash of [source][docId] containing in-memory sync states
const backends = {} // a hash by [docId] of current backend values
```

**Connecting**

Every peer need it's own sync state. You can initialize a new sync state using `initSyncState()`.

```js
syncStates[peerId][docId] = Automerge.Backend.initSyncState()
```

Automerge keeps track of ongoing exchanges with another peer using a `syncState` data structure. During synchronization, Automerge uses a probabilistic structure known as a Bloom filter to avoid having to send the full descriptions of every local change to peers. To reduce the size and cost of this structure, it is only built for changes the other peer has not already told us they have. This is described in more detail later in the [Internals section](docs/how-it-works/sync). 

To maintain this structure, when a peer is discovered, first create a new `syncState` via `initSyncState()`. These `syncState` objects can be persisted between program executions as an optimization, but it is not required. All subsequent sync operations with that peer will return a new `syncState` to replace the previous one.

If you've already seen a peer, you should load your old `syncState` for them via `decodeSyncState()`. This is not strictly necessary, but will reduce unnecessary computation and network traffic.

```js
  if (data.type === 'HELLO') {
    if (syncStates[source] === undefined) {
      syncStates[source] = {}
      syncStates[source][docId] = Automerge.Backend.decodeSyncState(db.getSyncState(docId, source))
      sendMessage({ source: workerId, target: source, type: 'HELLO' })
    }
    return
  }
```

**Synchronizing with one or more peers**

In general, whenever a peer creates a local change or receives a sync message from another peer, it should respond to all the peers it is connected to with its updated status. This will both confirm receipt of any data to the sending peer and also allow other peers to request any changes they may still need. 

Generating new sync messages to other peers is straightforward. Simply call `generateSyncMessage` and, if `syncMessage` is not null, send it to the appropriate peer. You will also need to hold on to the returned `syncState` for that peer, since it keeps track of what data you have sent them to avoid sending data twice.

Here is a simple example:
```js
function updatePeers(docId: string) {
  Object.entries(syncStates).forEach(([peer, syncState]) => {
    const [nextSyncState, syncMessage] = Automerge.Backend.generateSyncMessage(
      backends[docId],
      syncState[docId] || Automerge.Backend.initSyncState(),
    )
    syncStates[peer] = { ...syncStates[peer], [docId]: nextSyncState }
    if (syncMessage) {
      sendMessage({
        docId, source: workerId, target: peer, syncMessage,
      })
    }
  })
}
```

**Receiving sync messages**

Receiving sync messages requires the document, syncState, and incoming message. Pass these arguments to `receiveSyncMessage()`, and keep the updated results. Calling `receiveSyncMessage` may also produce a `patch`, which you must forward to the frontend.

After receiving a sync message, you should check if you need to send new sync messages to any connected peers using the code above. In our example code below this is represented by a call to `updatePeers()`:

```js
  const [nextBackend, nextSyncState, patch] = Automerge.Backend.receiveSyncMessage(
    backends[docId],
    syncStates[source][docId] || Automerge.Backend.initSyncState(),
    syncMessage,
  )
  backends[docId] = nextBackend
  syncStates[source] = { ...syncStates[source], [docId]: nextSyncState }

  updatePeers(docId)

  if (patch) {
    sendPatchToFrontend({ docId, patch })
  }
}
```

**Applying and distributing local changes**

When you create a local change to a document, simply call `generateSyncMessage()` for each peer to produce a message to send them. In general, you can use the same `updatePeers()` implementation for both receiving messages and creating local changes. You may want to rate limit or debounce these communications to reduce network traffic, but this isn't required. *Remember, after applying a local change to the backend you will need to forward the resulting patch to your frontend!*

Here's a sample implementation:

```js
// sample message data format for sending from a renderer to a worker in a browser  
interface FrontendMessage {
  docId: string
  type: "OPEN" | "LOCAL_CHANGE"
  payload: Uint8Array
} 

// Respond to messages from the frontend document
self.addEventListener('message', (event: Event) => {
  const { data: FrontendMessage } = event
  const { docId } = data

  if (data.type === 'OPEN') {
    backends[docId] = Automerge.Backend.init()
  }

  if (data.type === 'LOCAL_CHANGE') {
    const [newBackend, patch] = Automerge.Backend.applyLocalChange(backends[docId], data.payload)
    backends[docId] = newBackend
    sendMessageToRenderer({ docId, patch })
  }

  // now tell everyone else about how things have changed
  updatePeers(docId)
})

```

**Handling disconnection**

Remember to save your syncState object for a peer upon disconnection via `encodeSyncState()`. That might look like this:

```js
db.storeSyncState(docId, source, encodeSyncState(syncStates[source]))
```
