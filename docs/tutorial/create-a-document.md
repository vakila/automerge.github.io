---
sidebar_position: 3
---
# Create a Document

An Automerge document is a JSON object. Similar to a NoSQL database, a document allows you to track the state of your application.  

To create a new document, we want to start with 

```js
let doc = Automerge.init()
```

This document is a simple JavaScript object, which can be accessed like any other object. 

However, you can't just set properties on an Automerge document. With a typical JavaScript object, you might do:

```js
let obj = {}
obj.count = 0
obj.count++
console.log(obj)
```

Automerge documents are immutable and follow a **functional** pattern. 


```js
const doc1a = Automerge.from<Doc>({ count: new Automerge.Counter(0), text: 'one' });
const doc2a = Automerge.from<Doc>({ count: new Automerge.Counter(0), text: 'two' });
```
This creates two documents with totally different objects. doc1a.count is not the same object as doc2a.count  so when you get the changes between the docs later on the underlying objectids are different. When, later on, you get the changes and apply them it'll attempt to recreate the count object instead of realizing they are the same object. You'd have to initialize doc1a  and doc2a from the same document (so it understands there is a shared history), then increment one of them, then apply to get the result your seeking. Example (didn't test):

```js
const doc1a = Automerge.from({count: new Automerge.Counter(0)})
const doc2a = Automerge.merge(Automerge.init(), s2)

const doc1b = Automerge.change(s1, doc => {doc.counter.increment()});

const changes = Automerge.getChanges(doc1a, doc1b)
const applied = Automerge.applyChanges(doc2a, changes)
```