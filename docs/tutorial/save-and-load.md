---
sidebar_position: 5
---
# Save and Load

```js
let saved = Automerge.save(doc1b)
sendToNetwork(docId, saved)

/// >< ///

let binary = getFromNetwork(docId)
let doc2 = Automerge.load(binary);
doc2 = Automerge.change(doc2, (draft) => {
	draft.count.increment();
	draft.text = `incremented ${draft.count.value}`;
});
```
