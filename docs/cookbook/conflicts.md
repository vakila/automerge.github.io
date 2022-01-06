---
sidebar_position: 6
---

# Managing Conflicts

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


