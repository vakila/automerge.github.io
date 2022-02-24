---
sidebar_position: 3
---
# Your first document

An Automerge document is a JSON object. Similar to a NoSQL collection, a document allows you to track the state of your application.  

To create a new document, we want to start with 

```js
let doc = Automerge.init()
```

This document is a simple JavaScript object, which can be accessed like any other object. 

However, you can't just set properties on an Automerge document. With a typical JavaScript object, you might do:

```js
> let obj = {}
> obj.count = 0
> obj.count++
> obj
{ count: 1 }
```

In contrast, Automerge documents are immutable and follow a **functional** pattern. This means that you can retrieve properties from a document, but you can't change them like you would in a typical JavaScript object. 

## ActorId

Each instance of a document has an actorId. This is useful for Automerge to know which process or device is making changes. It's important that every processes has a unique actorId. Every time you make an Automerge document, it automatically generates an actorId for you.

To try this out, print it to the console using `Automerge.getActorId(doc)`:

```js
let doc = Automerge.init()
let actorId = Automerge.getActorId(doc)
console.log(actorId)
```

Notice that every time you refresh the page, the actorId is a different randomly generated string. 

## Modeling our data

We want to build a todo list, which will have the following requirements:

* A list of todo items 
* Each item has: a text box, boolean checkmark
* An input box to add another item 

When the document is first created, it has no schema. Automerge documents, unlike SQL databases, do not have a fixed schema that you set at the beginning. Instead, we make changes to those documents over time. See the next section to make your first change.
