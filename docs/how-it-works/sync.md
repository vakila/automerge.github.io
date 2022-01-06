# Sync Protocol 

The Automerge network sync protocol is designed to bring two documents into sync by exchanging messages between peers until both documents have the same contents. The protocol can run on top of any connection-based network link that supports bidirectional messages, including WebSocket, WebRTC, or plain TCP. It can be used in any network topology: client/server, peer-to-peer, or server-to-server sync are all supported.

The protocol works by exchanging rounds of sync messages. These sync messages contain two parts: 
 * a lossily-compressed list of changes it already has (implicitly requesting the remainder)
 * changes it believe the other peer needs

Each node will also maintain a local `syncState` for each peer they want to synchronize with, which keeps track of what the local node knows about that peer. This sync state has to be kept around during synchronization, and can be saved to disk between executions as a performance optimization, but will be automatically regenerated if the protocol detects any problems.

On connection, each peer should start the exchange with an initial message via `generateSyncMessage(doc, syncState)`. This first message generally does not include changes, but provides the recipient with the information it needs to determine which changes it should send. Upon receiving any message, a peer should always call `receiveSyncMessage(doc, syncState, message)`. This will update the `syncState` with the information necessary to calculate what changes to send, and also cause Automerge to apply any changes it received. The developer can now call `generateSyncMessage(doc, syncState)` to produce the next message to a peer. 

From then on, a peer should continue to call these functions until `generateSyncMessage()` returns a `null` value, indicating both peers are synchronized and no further communication is necessary.

The algorithm is described in more detail in [this paper](https://arxiv.org/abs/2012.00472) and [this blog post](https://martin.kleppmann.com/2020/12/02/bloom-filter-hash-graph-sync.html).

### The first exchanges
If we don't already have any existing sync state with a peer, the first call to `generateSyncMessage()` will create a Bloom filter which contains encoded hashes of all the changes in the document. The recipient of this message will walk their local graph of changes backwards from each "head" in their document until the Bloom filter indicates the other peer has the change in question. Everything from that point forward is collected and sent in a response message -- along with a new bloom filter so the other peer can reciprocate.

### On the Bloom Filter
Conceptually, the most straightforward way to synchronize the two sets of changes would be to send over the complete list of changes from one peer to another, which could then exactly request the changes it was needed and offer any changes only it had. Unfortunately, this approach is prohibitively expensive. Every change is notionally represented by a 256-bit hash, which in cases like text editing can be larger than the actual change. By sending the compressed list of changes a document already *has* to the other peer, the recipient can then reply with their own changes they believe the sender is lacking. To reiterate because this was counter-intuitive: the receiver cannot determine which changes it needs by looking at the Bloom filter, only (estimate) what changes the sender needs.

### False positives

Bloom filters encode data probabalistically. The Automerge Bloom filter implementation is tuned such that there is a 1% chance per change of mistakenly believing the other peer already has the change in question. When this occurs, the receiving peer will not see any result from applying those changes. Until all change dependencies are in place, the new changes will remain invisible. To resolve this, the next syncMessage will include a `need` request which specifies particular changes by hash to send from the other peer.

### Shared Heads
To avoid constantly recalculating and retransmitting Bloom filters, the `syncState` tracks the "greatest common document" the two peers have in common. Every time changes are received and applied, we can safely skip adding those changes to any subsequent the Bloom filter. Thus, we simply begin adding changes to the Bloom filter at that point in the document history.

### Bloom filter example 

```js
a: [ a0, b0, a1, b1 ] + [ a2, a3 ]
b: [ a0, b0, a1, b1 ] + [ b2, b3 ]
```

In this example, we show data on two peers. If we imagine in some past synchronization exchange both peers synchronized and wound up with "shared heads" of `[a1, b1]`. This is the "greatest common document". To synchronize the two nodes, peer `a` would encode their local changes `[a2, a3]` into a Bloom filter and send them to `b`.

Upon receipt, `b` would check the Bloom filter for each of its local changes beginning with `b2`. Once it found a change `a` was missing, it would assume all subsequent changes should be sent. Thus 99% of the time (as we noted, the Bloom filter is probabalistic), it would send all the changes `a` needed. The remaining 1% of the time, it would mistakenly not send `b2`, but rather begin sending changes with `b3`. In this case, upon receiving those changes, `a` would see that it was still missing the `b2` dependency for `b3` and explicitly request it. 

### Error Recovery
Finally, Automerge helps recover failed peer nodes by resetting the list of `sharedHeads` in the document and beginning sync again from scratch. This can come in handy if one of the peers crashes after confirming data but before writing it to disk.

If the connection times out due to packet loss, when you reconnect, you should reset the sync state as follows, if you haven't already:

```js
for (let docId of Object.keys(syncStates[peer])) {
  syncStates[peer][docId] = decodeSyncState(encodeSyncState(syncStates[peer][docId]))
}
```

This tells the sync protocol that the last message it sent may have been lost, and restarts the sync protocol from the last known "greatest common document".

### Multiple Peers, Multiple Documents

The Automerge sync protocol behaves correctly when synchronizing with multiple peers at once, though specific implementation details will vary by domain. Synchronizing multiple documents is not currently supported by the protocol, and must be handled by the user at a layer above.

### Sequencing Network Communication
Many communication protocols require that only one of the two peers initiates the exchange. With Automerge this is not the case: messages between peers can interleave arbitrarily, though each peer's messages should be delivered in-order to the recipient.