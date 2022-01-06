---
sidebar_position: 4
---
# Make a Change

## Gotcha

The following will not work, for example, as you're passing the same beforeDoc into applyChanges more than once (the second time you do that will throw an exception):

```js
const beforeDoc = ...
const after1 = Automerge.applyChanges(beforeDoc, [change1])
const after2 = Automerge.applyChanges(beforeDoc, [change2])
```

But if you've got a linear chain of changes, you can still refer to old document versions:

```js
const beforeDoc = ...
const after1 = Automerge.applyChanges(beforeDoc, [change1])
const after2 = Automerge.applyChanges(after1, [change2])
// beforeDoc, after1, and after2 are all valid documents
```