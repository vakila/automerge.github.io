---
sidebar_position: 3
---

# Quick Start

This is a 30-minute guide that will get you up and running with Automerge in your own application. This guide is recommended for you if you have strong understanding of JavaScript fundamentals and CRDTs. If you find this quick start to be complicated, we recommend trying the [Tutorial](/docs/tutorial/setup) section.


## Setup

Installation

```bash
npm install automerge ## or yarn add automerge
```


## Quick Start

This is how you load Automerge in Node. In a browser, simply including the
script tag will set up the Automerge object.

You can also use `import * as Automerge from 'automerge'` if you are using ES2015 or TypeScript.

```js
const Automerge = require('automerge')
```

Let's say doc1 is the application state on device 1. Further down we'll simulate a second device. We initialize the document to initially contain an empty list of cards.

```js
let doc1 = Automerge.from({ cards: [] })
```

Automerge follows good functional programming practice. The `doc1` object is treated as immutable -- you  never change it directly. To change it, you need to call `Automerge.change()` with a callback in which you can mutate the state. 


```js
doc1 = Automerge.change(doc1, 'Add card', doc => {
  doc.cards.push({ title: 'Rewrite everything in Clojure', done: false })
  doc.cards.push({ title: 'Rewrite everything in Haskell', done: false })
})
// { cards: [ 
//    { title: 'Rewrite everything in Haskell', done: false },
//    { title: 'Rewrite everything in Clojure', done: false } ]} 
```

`Automerge.change(doc, [message], changeFn)` enables you to modify an Automerge document `doc`,
returning an updated copy of the document.

The `message` argument is optional. It allows you to attach an arbitrary string to the change, which is not
interpreted by Automerge, but saved as part of the change history.

Now let's simulate another device, whose application state is `doc2`. We must
initialise it separately, and merge `doc1` into it. After merging, `doc2` is a replicated copy of `doc1`.

```js
let doc2 = Automerge.init()
doc2 = Automerge.merge(doc2, doc1)
```


Now, when both documents, we make separate (non-conflicting) changes. For handling conflicting changes, read below in [Conflicts](#conflicts).
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
// { cards: [ { title: 'Rewrite everything in Haskell', done: true } ] }
```


As our final trick, we can inspect the change history. Automerge automatically
keeps track of every change, along with the "commit message" that you passed to
change(). When you query that history, it includes both changes you made
locally, and also changes that came from other devices. You can also see a
snapshot of the application state at any moment in time in the past. For
example, we can count how many cards there were at each point:

```js
Automerge.getHistory(finalDoc).map(state => [state.change.message, state.snapshot.cards.length])
// [ [ 'Initialization', 0 ],
//   [ 'Add card', 1 ],
//   [ 'Add another card', 2 ],
//   [ 'Mark card as done', 2 ],
//   [ 'Delete card', 1 ] ]
```

## Lists

JavaScript Arrays are fully supported in Automerge. You can use `push`, `unshift`, `insertAt`, `splice`, loops, and nested objects.

```js
newDoc = Automerge.change(currentDoc, doc => {
  doc.list = [] // creates an empty list object
  doc.list.push(2, 3) 
  doc.list.unshift(0, 1) // unshift() adds elements at the beginning
  doc.list[3] = Math.PI // overwriting list element by index
  // now doc.list is [0, 1, 2, 3.141592653589793]
  // Looping over lists works as you'd expect:
  for (let i = 0; i < doc.list.length; i++) doc.list[i] *= 2
  // now doc.list is [0, 2, 4, 6.283185307179586]
  doc.list.splice(2, 2, 'automerge')
  // now doc.list is [0, 'hello', 'automerge', 4]
  doc.list[4] = { key: 'value' } // objects can be nested inside lists as well
  // Arrays in Automerge offer the convenience functions `insertAt` and `deleteAt`
  doc.list.insertAt(1, 'hello', 'world') // inserts elements at given index
  doc.list.deleteAt(5) // deletes element at given index
  // now doc.list is [0, 'hello', 'world', 2, 4]
})
```

If you have previously worked with immutable state in JavaScript, you might be in the habit of
using [idioms like these](https://redux.js.org/recipes/structuring-reducers/updating-normalized-data):

```js
state = Automerge.change(state, 'Add card', doc => {
  const newItem = { id: 123, title: 'Rewrite everything in Rust', done: false }
  doc.cards = {
    ids: [...doc.cards.ids, newItem.id],
    entities: { ...doc.cards.entities, [newItem.id]: newItem }
  }
})
```

While this pattern works fine outside of Automerge, please **don't do this in Automerge**! Please
use mutable idioms to update the state instead, like this:

```js
state = Automerge.change(state, 'Add card', doc => {
  const newItem = { id: 123, title: 'Rewrite everything in Rust', done: false }
  doc.cards.ids.push(newItem.id)
  doc.cards.entities[newItem.id] = newItem
})
```

Even though you are using mutating APIs, Automerge ensures that the code above does not actually
mutate `state`, but returns a new copy of `state` in which the changes are reflected. The problem
with the first example is that from Automerge's point of view, you are replacing the entire
`doc.cards` object (and everything inside it) with a brand new object. Thus, if two users
concurrently update the document, Automerge will not be able to merge those changes (instead, you
will just get a conflict on the `doc.cards` property).

The second example avoids this problem by making the changes at a fine-grained level: adding one
item to the array of IDs with `ids.push(newItem.id)`, and adding one item to the map of entities
with `entities[newItem.id] = newItem`. This code works much better, since it tells Automerge
exactly which changes you are making to the state, and this information allows Automerge to deal
much better with concurrent updates by different users.

As a general principle with Automerge, you should make state updates at the most fine-grained
level possible. Don't replace an entire object if you're only modifying one property of that
object; just assign that one property instead.


## Counters

## Conflicts

Automerge allows different nodes to independently make arbitrary changes to their respective copies
of a document. In most cases, those changes can be combined without any trouble. For example, if
users modify two different objects, or two different properties in the same object, then it is
straightforward to combine those changes.

If users concurrently insert or delete items in a list (or characters in a text document), Automerge
preserves all the insertions and deletions. If two users concurrently insert at the same position,
Automerge will arbitrarily place one of the insertions first and the other second, while ensuring
that the final order is the same on all nodes.

The only case Automerge cannot handle automatically, because there is no well-defined resolution, is
**when users concurrently update the same property in the same object** (or, similarly, the same
index in the same list). In this case, Automerge arbitrarily picks one of the concurrently written
values as the "winner":

```js
// Initialize documents with known actor IDs
let doc1 = Automerge.change(Automerge.init('actor-1'), doc => {
  doc.x = 1
})
let doc2 = Automerge.change(Automerge.init('actor-2'), doc => {
  doc.x = 2
})
doc1 = Automerge.merge(doc1, doc2)
doc2 = Automerge.merge(doc2, doc1)
// Now, doc1 might be either {x: 1} or {x: 2} -- the choice is random.
// However, doc2 will be the same, whichever value is chosen as winner.
assert.deepEqual(doc1, doc2)
```

Although only one of the concurrently written values shows up in the object, the other values are
not lost. They are merely relegated to a conflicts object. Suppose `doc.x = 2` is chosen as the
"winning" value:

```js
doc1 // {x: 2}
doc2 // {x: 2}
Automerge.getConflicts(doc1, 'x') // {'1@01234567': 1, '1@89abcdef': 2}
Automerge.getConflicts(doc2, 'x') // {'1@01234567': 1, '1@89abcdef': 2}
```

Here, we've recorded a conflict on property `x`. The object returned by `getConflicts` contains the
conflicting values, both the "winner" and the "loser". You might use the information in the
conflicts object to show the conflict in the user interface. The keys in the conflicts object are
the internal IDs of the operations that updated the property `x`.

The next time you assign to a conflicting property, the conflict is automatically considered to be
resolved, and the conflict disappears from the object returned by `Automerge.getConflicts()`.


