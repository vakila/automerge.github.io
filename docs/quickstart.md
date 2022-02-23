---
sidebar_position: 1
---

# 5 minute quick start

This guide will get you up and running with Automerge in your own application. This guide is recommended for you if you have strong understanding of JavaScript fundamentals and CRDTs. If you find this quick start to be complicated, we recommend trying the [Tutorial](/docs/tutorial/introduction) section.


## Setup

Installation

```bash
npm install automerge ## or yarn add automerge
```


## Creating a document

This is how you load Automerge in Node.
You can also use `import * as Automerge from 'automerge'` if you are using ES2015 or TypeScript.

```js
const Automerge = require('automerge')
```

In a browser-based app, you can load Automerge with a script tag, which will set up a global variable called `Automerge`:

```html
<script type="application/javascript" src="https://cdn.jsdelivr.net/npm/automerge@1.0.1-preview.7/dist/automerge.min.js"></script>
```

Let's say doc1 is the application state on device 1. Further down we'll simulate a second device. We initialize the document to initially contain an empty list of cards.

```js
const doc1 = Automerge.init()
```

Automerge follows good functional programming practice. The `doc1` object is treated as immutable -- you  never change it directly. To change it, you need to call `Automerge.change()` with a callback in which you can mutate the state. 


## Making changes

```js
doc1 = Automerge.change(doc1, 'Add card', doc => {
  doc.cards = []
  doc.cards.push({ title: 'Rewrite everything in Clojure', done: false })
  doc.cards.push({ title: 'Rewrite everything in Haskell', done: false })
})
// { cards: [
//    { title: 'Rewrite everything in Clojure', done: false },
//    { title: 'Rewrite everything in Haskell', done: false } ]}
```

`Automerge.change(doc, [message], changeFn)` enables you to modify an Automerge document `doc`,
returning an updated copy of the document.

The `message` argument is optional. It allows you to attach an arbitrary string to the change, which is not interpreted by Automerge, but saved as part of the change history.

The `doc1` returned by `Automerge.change()` is a regular JavaScript object containing all the
edits you made in the callback. Any parts of the document that you didn't change are carried over
unmodified. The only special things about it are:

  - It is treated as immutable, so all changes must go through `Automerge.change()`.
  - Every object has a unique ID, which you can get by passing the object to the
    `Automerge.getObjectId()` function. This ID is used by Automerge to track which object is which.
  - Objects also have information about _conflicts_, which is used when several users make changes to
    the same property concurrently (see [conflicts](cookbook/conflicts)). 

## Merging documents

Now let's simulate another device, whose application state is `doc2`. We must
initialise it separately, and merge `doc1` into it. After merging, `doc2` is a replicated copy of `doc1`.

```js
let doc2 = Automerge.init()
doc2 = Automerge.merge(doc2, doc1)
```

You can also load the document as a binary, if you want to send the document over the network in a compact format.

```js
let binary = Automerge.save(doc1)
let doc2 = Automerge.load(binary)
```

Now, when both documents are ready, we make separate (non-conflicting) changes. For handling conflicting changes, see the section on [conflicts](cookbook/conflicts).

```js
doc1 = Automerge.change(doc1, 'Mark card as done', doc => {
  doc.cards[0].done = true
})
doc2 = Automerge.change(doc2, 'Delete card', doc => {
  delete doc.cards[1]
})
```

Now comes the moment of truth. Let's merge the changes again. You can also do the merge the other way around, and you'll get the same result. Order doesn't matter here. The merged result remembers that 'Rewrite everything in Haskell' was set to true, and that 'Rewrite everything in Clojure' was deleted:

```js
let finalDoc = Automerge.merge(doc1, doc2)
// { cards: [ { title: 'Rewrite everything in Clojure', done: true } ] }
```

## Get change history


As our final trick, we can inspect the change history. Automerge automatically
keeps track of every change, along with the "commit message" that you passed to
change(). When you query that history, it includes both changes you made
locally, and also changes that came from other devices. You can also see a
snapshot of the application state at any moment in time in the past. For
example, we can count how many cards there were at each point:

```js
Automerge.getHistory(finalDoc).map(state => [state.change.message, state.snapshot.cards.length])
// [ [ 'Add card', 2 ],
//   [ 'Mark card as done', 2 ],
//   [ 'Delete card', 1 ] ]
```

## More

If you're hungry for more, look in the [Cookbook](cookbook/modeling-data) section.
