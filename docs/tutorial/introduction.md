---
sidebar_position: 1
---

# Introduction

Before getting into the code, we suggest that you sit down for a few minutes to understand some core concepts. If you've used CRDTs before and know how they work, you can safely skip this page. Although we may use terms that are specific to Automerge, these properties are fundamental to building any application using CRDTs.  

## With or without the internet

> Philosophically, if I modify a google doc my computer is asking Google for permission to edit the file. (You can tell because if google’s servers say no, I lose my changes.) In comparison, if I git push to github, I’m only notifying github about the change to my code. My repository is mine. I own all the bits, and all the hardware that houses them. This is how I want all my software to work.
>
> *["I was wrong, CRDTs are the future"](https://josephg.com/blog/crdts-are-the-future/) by Joseph Gentle*

With Automerge, you can build software that works with or without the Internet. In Automerge, data is stored *first* on the user's device, and then *secondly* somewhere else. In contrast, an app backed with MongoDB stores the data primarily on a Cloud server. To change a document, you can send an HTTP PUT or POST request to the server. If you're offline, you can't make changes to the database. If you cache a user's requests and send them once you come online, users could accidentally override each other's work. This means that Cloud application require users to be online in order to change or interact with data. The server handles things like race conditions and transactions to ensure that everyone sees the same application state and (hopefully) no one's work gets lost. 

In contrast, the apps you can build with automerge don't require this central server. Instead, every device in the system is a replica, or copy, of the entire database (or a queried subset or snapshot). To change an Automerge document, you create a *change*. This *change* is a small set of metadata that describes an update to a data structure within the document. For example, an insertion of an element to a list or deletion of an element from a list are both examples of separate changes. Every change is put in to a local append-only log of changes. 

EXAMPLE WITH VISUALS

This list of changes is stored locally on the device. When other devices come online, all sides send their changes to each other. Automerge guarantees that any device with the same set of changes will converge to the same state. Additionally, changes are commutative, which means that the order in which they are applied does not matter.

Applications built with Automerge are assumed to be *eventually consistent.* Users should expect to see the same application state as all other devices, **eventually**. This is a radical shift from how most multi-user applications work today, which require systems to be highly available. 

If you're used to building applications with a database in the Cloud, such as PostgreSQL, you'll encounter new and exciting challenges. Building an eventually consistent application will require you to rethink how you typically handle data.

## Deletion

Deletion is another instance of a change. Unlike what you might expect from a typical database, a deletion doesn't actually delete the data. For example, in a list, we create a change that marks the element in the list as deleted. This marker makes that element be hidden from view. Thus, user-generated content may be available forever on some devices. 

What happens when one user modifies an element and another user deletes that same element? 
-- CONFLICTS
