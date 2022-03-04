# How Automerge works

This document explains how Automerge stores data internally. You shouldn't need
to read it in order to use Automerge in your application, but you might find it
useful if you want to hack on the Automerge code itself.


## Document, changes, and operations

You get an Automerge instance by calling `Automerge.init()` (creates a new, empty
document) or `Automerge.load()` (loads an existing document, typically from
a file on disk). By default, this document exists only in memory on a single
device, and you don't need any network communication for read or write access.
There may be a separate networking layer that asynchronously propagates changes
from one device to another, but that networking layer is outside of the scope of
Automerge itself.

The Automerge instance represents the current state of your application (or some part of it).
The state is immutable and is never updated in place. Instead, whenever you want
to do something that changes the state, you call a function that takes the old
state as first argument, and returns a new state reflecting the change. There
are two ways how the state can change:

1. **Local changes**, which are generally triggered by the user changing some
   piece of application data in the user interface. Such editing by the user is
   expressed by calling `Automerge.change()`, which groups together a block
   of operations that should be applied as an atomic unit. Within the change
   callback you have access to a mutable version of the Automerge document,
   implemented as a
   [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)).
   The proxy records any mutations you make as *operations* (e.g. changing the
   value of a particular property of a particular object). The `change()`
   function returns a new copy of the state with those operations applied.
2. **Remote changes**: a user on another device has edited their copy of
   a document, that change was sent to you via the network, and now you want
   to apply it to your own copy of the document. Remote operations are applied
   using `Automerge.applyChanges()`, which again returns a new copy of the
   state. For testing purposes there is also `Automerge.merge()`, which is
   is a short-cut for the case where the "remote" document is actually just
   another instance of Automerge in the same process.

Some terminology:

* An **operation** is a fine-grained description of a single modification, e.g.
  setting the value of a particular property of a particular object, or
  inserting one element into a list. Users normally never see operations — they
  are a low-level implementation detail.
* A **change** is a collection of operations grouped into a unit that is
  applied atomically (a bit like a database transaction). Each call to
  `Automerge.change()` produces exactly one change, and inside the change there
  may be any number of operations. A change is also the smallest unit that gets
  transmitted over the network to other devices.
* A **document** is the state of a single Automerge instance. The state of a
  document is determined by the set of all changes that have been applied to
  it. Automerge ensures that whenever any two documents have seen the same
  set of changes, even if the changes were applied in a different order, then
  those documents are in the same state. This means an Automerge document is a
  [CRDT](https://crdt.tech/).

`Automerge.getChanges()` returns all the changes that have occurred between one
document state and another, so that they can be encoded and sent over the
network to other devices. On the recipient's end, `Automerge.applyChanges()`
updates the corresponding document to incorporate those changes.

You can save a document to disk using `Automerge.save()`. This function returns
a byte array in which the state of the document has been encoded in a compressed
form. Conversely, `Automerge.load()` decodes that byte array and returns an
instance of the document. You can store this byte array in whatever way works
best on your platform, e.g. as a file on the filesystem, or in IndexedDB in
a web browser. The saved document state actually contains the entire change
history of the document (a bit like a Git repository), but the compression makes
this efficient.

One day, we may need to allow this history to be pruned in order to save disk
space. There are also privacy implications in storing the whole history: any
new collaborator who gets access to a document can see all past states of the
document, including any content that is now deleted. However, for now we are
choosing to preserve all history as it makes synchronisation easier (imagine
a device that has been offline for a long time, and then needs to catch up on
everything that has been changed by other users while it was offline).
Moreover, being able to inspect edit history is itself a useful feature.


## Actor IDs and dependencies

Each Automerge instance has an **actor ID** — a UUID that is generated randomly
whenever you do `Automerge.init()` or `Automerge.load()` (unless you explicitly
pass an actor ID into those functions). Whenever you make a local edit on that
Automerge instance, the operations are tagged with that actor ID as the origin.
All changes made on a Automerge instance are numbered sequentially, starting
with 1 and never skipping or reusing sequence numbers. We assume that nobody
else is using the same actor ID, and thus each change is uniquely identified
by the combination of its originating actor ID and its sequence number. That
unique identifier for the change always remains fixed, even when it is
applied on remote copies of the document.

An actor ID is a bit similar to a device ID. Each device can generate changes
independently from every other device, and so each device needs to have its own
numbering sequence. You can have several actor IDs for the same device, for
example if the user might run several instances of the application on the same
device (in which case, each instance needs its own actor ID). However, there is
a performance cost to having lots of actor IDs, so it's a good idea to keep
using the same actor ID if possible (at least for the lifetime of an application
process).

When you make several changes to a document over time, later changes may depend
on earlier ones. For example, an earlier change may create a list object, and
a later change may insert an item into that list. To track those changes, each
change contains the SHA-256 hashes of the changes it depends on (similarly to
how a Git commit contains the hashes of the previous commit).

In a sequential editing history, each change contains has only one dependency
hash. But if several users are working concurrently (perhaps even working
offline), the hash graph may contain branches and merges. A merge occurs when
there is a change that has more than one dependency, similarly to a merge commit
in Git. 

When we send changes from one device to another, we apply the changes in the
order specified by the dependencies between them. `Automerge.applyChanges()`
performs this ordering automatically. If two changes appear in parallel
branches, we call them *concurrent*, and they may be applied in either order.
