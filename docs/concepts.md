---
sidebar_position: 2
---

# Key Concepts 

Before getting into the code, we suggest that you sit down for a few minutes to understand some core concepts. Some of these topics are fundamental to understanding how distributed databases work. Although we may use terms that are specific to Automerge, these properties are fundamental to building applications using CRDTs.  

## CRDTs


> Philosophically, if I modify a google doc my computer is asking Google for permission to edit the file. (You can tell because if google’s servers say no, I lose my changes.) In comparison, if I git push to github, I’m only notifying github about the change to my code. My repository is mine. I own all the bits, and all the hardware that houses them. This is how I want all my software to work.
>
> *["I was wrong, CRDTs are the future"](https://josephg.com/blog/crdts-are-the-future/) by Joseph Gentle*

Automerge is a type of CRDT (Conflict-Free Replicated Datatype). A CRDT is a data structure that simplifies multi-user applications. We can use them to syncronize data between two devices in a way that both devices see the same application state.  In many systems, copies of some data need to be stored on multiple computers. Examples include:
  * Mobile apps that store data on the local device, and that need to sync that data to other devices belonging to the same user (such as calendars, notes, contacts, or reminders);
  * Distributed databases, which maintain multiple replicas of the data (in the same datacenter or in different locations) so that the system continues working correctly if some of the replicas are offline;
  * Collaboration software, such as Google Docs, Trello, Figma, or many others, in which several users can concurrently make changes to the same file or data;
  * Large-scale data storage and processing systems, which replicate data in order to achieve global scalability.

*[Read more about CRDTs](https://crdt.tech/)*


## Eventual Consistency

Applications built with Automerge are assumed to be *eventually consistent.* Users should expect to see the same application state as the other users they collaborate with, **eventually**. This is a radical shift from how most multi-user applications work today, which require systems to be highly available. All users in a multi-user application are typically required online in order to change or interact with the app. In contrast, an eventually consistent application will always allow the user to type into the application. When the users come back online, their computers can syncronize and update to the latest state.

If you're used to building applications with a database in the Cloud, such as PostgreSQL, you'll encounter new and exciting challenges. Building an eventually consistent application will require you to rethink how you typically handle data. It flips scaling on it's head, and challenges some of the fundamental properties about Cloud databases.  

## Documents

A document is a collection of data that holds the current state of the application. A document in Automerge is represented as an object. Each document has a set of keys which can be used to hold variables that are one of the Automerge datatypes.

## Types

All collaborative data structures conform to certain rules. Each variable in the document must be of one of the implemented types. Each type mmust conform to the rules of CRDTs. Automerge comes with a set of pre-defined types such as `Map`, `Array`, `Counter`, `number`, `Text`, and so on.

## Changes

A change is a small set of metadata that describes an update to a data structure within the document. For example, a insertion of an element to a list is an example of a change. All changes are commutative, which means that the order in which they are applied does not matter. In other words, as long as all of the same set of changes have been applied, all replicas of that data structure should see the same state.

To do this, typically each change depends upon a previous change. Automerge creates a graph of changes that are modeled as a tree. This internal data structure is convienent as we are able to walk the tree efficiently to compute the application state at any given time. To learn more about how automerge works internally, see the [Internals](how-it-works/backend) section.

## History

Each change that is made to a data structure builds upon other changes to create a shared, materialized view of a document. Each change is dependent on a previous change, which means that all replicas are able to construct a history of the data structure. This is a powerful propery in multi-user applications, and can be implemented in a way that is storage and space efficient.

## Deletion

Deletion is another instance of a change. Unlike what you might expect from a typical database, a deletion doesn't actually delete the data. For example, in a list, we mark the element as deleted. This marker tells replicas to hide that element from view. Thus, user-generated content may be available forever on some devices. 

## Compaction

Compaction is a way to serialize the current state of the document without the history. You might want to do this when:

* You don't want to replicate the entire history because of bandwidth or resource concerns on the target device. This might be useful in embedded systems or mobile phones.
* A deleted element contains some sensitive information that you would like to be purged from the history.

The downsides of compacting the history of a document include not being able to syncronize that compacted document with another document that doesn't have a common ancestor. 

## Synchronization

When two or more  devices make changes to a document, and then decide to exchange those changes to come to a consistent state, we call that *synchronization*. Syncronization can be in the form of sending all changes in history to each device. Alternatively, devices could negotiate which changes are missing on either end and exchange only those changes which are missing, rather than the entire change history. In some cases, this could be more efficient, but also increases complexity of the resulting networking code. 

### Peer to peer/Serverless
### Client server


## Authentication

