---
sidebar_position: 4
---
# Make a Change

In our MVP of the todo app, users will need two main interactions:

* Add a todo item
* Toggle a todo item as complete or not complete

To add a todo item to the list, we will call `Automerge.change`. We will make
sure `doc.items` exists, and then add a new item to the list with `done: false`.

```js
function addItem(doc, text) {
  let newDoc = Automerge.change(doc, doc => {
    if (!doc.items) doc.items = []
    doc.items.push({ text, done: false })
  })
  return newDoc
}
```

We return the new document from this function. Because Automerge is functional,
each document is immutable. The `newDoc` is now the document that should be
referenced after this change is made. The older document becomes stale and
cannot be used anymore.

Now, let's create an input element in the HTML so that items can be added to the list.

```html
<form>
  <input type="text" id="new-todo" />
</form>
```

```js
let form = document.querySelector("form")
let input = document.querySelector("#new-todo")
form.onsubmit = (ev) => {
  ev.preventDefault()
  doc = addItem(doc, input.value)
  input.value = null
}
```

Next, we have to render the items in the list every time an item is added.
