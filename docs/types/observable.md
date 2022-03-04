---
sidebar_position: 10
---

# Observable

An observable is an object that can be initialized to watch the state of a
document. When a document changes, the callback will fire with the diff and
changes that were applied to that document.

When you want to observe the changes in a document, pass an observable instance to `Automerge.init`:

```js
let observable = new Automerge.Observable()
let doc = Automerge.init({ observable })
observable.observe(doc, (diff, before, after, local, changes) => {
  // diff == {
  //  objectId: '_root', type: 'map', props: {bird: {[`1@${actor}`]: {type: 'value', value: 'Goldfinch'}}}
  // }
  // after.bird == 'Goldfinch'
  // local == true
  // changes.length == 1
})

doc = Automerge.change(doc, doc => doc.bird = 'Goldfinch')
```

You can also apply observables to properties on the Automerge document.
```js
observable.observe(doc.bird, (diff, before, after, local, changes) => {
  // before == 'Goldfinch'
  // after == 'Sparrow'
})

doc = Automerge.change(doc, doc => doc.bird = 'Sparrow')
```

As well as nested objects inside lists, text, or rows inside tables. See the [tests](https://github.com/automerge/automerge/blob/main/test/observable_test.js) for more examples.
