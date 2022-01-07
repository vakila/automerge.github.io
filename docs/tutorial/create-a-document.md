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
{ count: 1}
```

In contrast, Automerge documents are immutable and follow a **functional** pattern. This means that you can retrieve properties from a document, but you can't change them like you would in a typical JavaScript object. 
