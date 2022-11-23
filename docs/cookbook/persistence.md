---
sidebar_position: 3
---

# Persistence

When you build an app, you want to be able to save that user's data somewhere,
likely locally first and then remotely on a Cloud server, raspberry pi, mobile
phone, or other device. 

Automerge is an in-memory data structure library. It does not perform any I/O,
neither disk access nor network communication. Automerge includes
general-purpose building blocks for network protocols, but you need to use a
separate library to perform the actual communication (including encryption,
authentication, and access control). Similarly, disk persistence needs to happen
in a separate layer outside of Automerge.

## Strategies 

There are two ways you can store documents:

* as a log of changes: after every change you make, call `Automerge.getLastLocalChange(doc)` and store the byte array that is returned; to load the document, pass all those byte arrays to `Automerge.applyChanges()`
* as a whole document: use `Automerge.save(doc)` to encode the whole document as a byte array; store that on the server; and use `Automerge.load()` to load it again.

Storing one change at a time is good for small updates to a document, since it
will be more compact than storing the whole document over and over again. But
storing the whole document will be more compact (and faster) than storing the
whole log of changes since the document was created. This can be tested and
fine-tuned based on the number of changes you're saving at any one given time.
If you're saving hundreds of changes, it is probably more efficienty to simply
write the whole document to disk using `Automerge.save(doc)`. If you have a long
history and only want to sync one change, then using `getLastLocalChange` will
be more efficient.

## Automerge Binary Files

Automerge's binary format is very efficient, and uses the same data
representation in memory as on disk. In general, storing any data you get from
the network into the local filesystem, and loading documents from the filesystem
first will improve the perceived performance of your program.

`Automerge.save(doc)` serializes the state of Automerge document `doc` to a byte array
(`Uint8Array`), which you can write to disk (e.g. as a file on the filesystem if you're using
Node.js, or to IndexedDB if you're running in a browser). The serialized data contains the full
change history of the document (a bit like a Git repository).

`Automerge.load(byteArray)` unserializes an Automerge document from a byte array that was produced
by `Automerge.save()`.

> ### Note: Specifying `actorId`
>
> The Automerge `init` and `load` functions take an optional `actorId` parameter:
>
> ```js
> const actorId = '1234abcd567890011aa'
> const doc1 = Automerge.init(actorId)
> const doc3 = Automerge.load(str, actorId)
> ```
>
> The `actorId` is a byte-aligned hexidecimal string that uniquely identifies the current node. While there are many models for persistence and synchronization, every actor/thread/process which can generate unique changes to your document should be considered its own actor; In the most straightforward and default case, you omit `actorId`, a
> random UUID is generated. If you pass in your own `actorId`, you must ensure that there can never
> be two different processes with the same actor ID. Even if you have two different processes
> running on the same machine, they must have distinct actor IDs.
>
> **Unless you know what you are doing, you should stick with the default**, and let `actorId` be
> auto-generated.
>
> To get the `actorId` of the current node, call `Automerge.getActorId(doc)`.

