---
sidebar_position: 3
---

# Persistence

Automerge is an in-memory data structure library. It does not perform any I/O, neither disk access
nor network communication. Automerge includes general-purpose building blocks for network protocols,
but you need to use a separate library to perform the actual communication (including encryption,
authentication, and access control). Similarly, disk persistence needs to happen in a separate layer
outside of Automerge.

## Automerge Binary Files

`Automerge.save(doc)` serializes the state of Automerge document `doc` to a byte array
(`Uint8Array`), which you can write to disk (e.g. as a file on the filesystem if you're using
Node.js, or to IndexedDB if you're running in a browser). The serialized data contains the full
change history of the document (a bit like a Git repository).

`Automerge.load(byteArray)` unserializes an Automerge document from a byte array that was produced
by `Automerge.save()`.

> ### Note: Specifying `actorId`
>
> The Automerge `init`, `from`, and `load` functions take an optional `actorId` parameter:
>
> ```js
> const actorId = '1234-abcd-56789-qrstuv'
> const doc1 = Automerge.init(actorId)
> const doc2 = Automerge.from({ foo: 1 }, actorId)
> const doc3 = Automerge.load(str, actorId)
> ```
>
> The `actorId` is a string that uniquely identifies the current node; if you omit `actorId`, a
> random UUID is generated. If you pass in your own `actorId`, you must ensure that there can never
> be two different processes with the same actor ID. Even if you have two different processes
> running on the same machine, they must have distinct actor IDs.
>
> **Unless you know what you are doing, you should stick with the default**, and let `actorId` be
> auto-generated.
>
> To get the `actorId` of the current node, call `Automerge.getActorId(doc)`.


## HTTP Server

You can serialize these to files