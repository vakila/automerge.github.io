---
sidebar_position: 1
---

# Introduction

Automerge is a library of data structures for building collaborative applications.

For example, imagine you are developing a task-tracking app in which each task is represented by a card. In vanilla JavaScript you might write the following:
```js
const doc = Automerge.init()

// User adds a card
doc = Automerge.change(doc => {
  if (!doc.cards) doc.cards = []
  doc.cards.push({ title: 'Reticulate splines', done: false })
  doc.cards[0].done = true
})
```

You can have a copy of the application state locally on several devices (which
may belong to the same user, or to different users). Each user can independently
update the application state on their local device, even while offline, and save
the state to local disk. (Similar to git, which allows you to edit files and commit changes offline.)

When a network connection is available, Automerge figures out which changes need
to be synced from one device to another, and brings them into the same state. (Similar to git, which lets you push your own changes, and pull changes from other developers, when you are online.)

If the state was changed concurrently on different devices, Automerge automatically merges the changes together cleanly, so that everybody ends up in the same state, and no changes are lost. (Different from git: **no merge conflicts to resolve!**)

Automerge keeps track of the changes you make to the state, so that you can view old versions, compare versions, create branches, and choose when to merge them.(Similar to git, which allows diffing, branching, merging, and pull request workflows.)

## Design principles

- **Network-agnostic**. Automerge is a pure data structure library that does not care about what
  kind of network you use. It works with any connection-oriented network protocol, which could be
  client/server (e.g. WebSocket), peer-to-peer (e.g. WebRTC), or entirely local (e.g. Bluetooth).
  Bindings to particular networking technologies are handled by separate libraries;
  see the section on [Sending and receiving changes](#sending-and-receiving-changes) for examples.
  It also works with unidirectional messaging: you can send an Automerge file as email attachment,
  or on a USB drive in the mail, and the recipient will be able to merge it with their version.
- **Immutable state**. An Automerge object is an immutable snapshot of the application state at one
  point in time. Whenever you make a change, or merge in a change that came from the network, you
  get back a new state object reflecting that change. This fact makes Automerge compatible with the
  functional reactive programming style of [React](https://reactjs.org) and
  [Redux](http://redux.js.org/), for example.
- **Automatic merging**. Automerge is a _Conflict-Free Replicated Data Type_ ([CRDT](https://crdt.tech/)),
  which allows concurrent changes on different devices to be merged automatically without requiring any
  central server. It is based on [academic research on JSON CRDTs](https://arxiv.org/abs/1608.03960), but
  the details of the algorithm in Automerge are different from the JSON CRDT paper, and we are
  planning to publish more detail about it in the future.
- **Fairly portable**. We're not yet making an effort to support old platforms, but we have tested
  Automerge in Node.js, Chrome, Firefox, Safari, MS Edge, and [Electron](https://electron.atom.io/).
  For TypeScript users, Automerge comes with
  [type definitions](https://github.com/automerge/automerge/blob/main/@types/automerge/index.d.ts)
  that allow you to use Automerge in a type-safe way.

Automerge is designed for creating [local-first software](https://www.inkandswitch.com/local-first.html),
i.e. software that treats a user's local copy of their data (on their own device) as primary, rather
than centralising data in a cloud service. The local-first approach enables offline working while
still allowing several users to collaborate in real-time and sync their data across multiple
devices. By reducing the dependency on cloud services (which may disappear if someone stops paying
for the servers), local-first software can have greater longevity, stronger privacy, and better
performance, and it gives users more control over their data.
The [essay on local-first software](https://www.inkandswitch.com/local-first.html) goes into more
detail on the philosophy behind Automerge, and the pros and cons of this approach.

However, if you want to use Automerge with a centralised server, that works fine too! You still get
useful benefits, such as allowing several clients to concurrently update the data, easy sync between
clients and server, being able to inspect the change history of your app's data, and support for
branching and merging workflows.