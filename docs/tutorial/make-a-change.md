---
sidebar_position: 4
---
# Make a change

In our minimalist todo app, users will need two main interactions:

* Add a todo item
* Toggle a todo item as complete or not complete

To add a todo item to the list, we will call `Automerge.change`. We will make
sure `doc.items` exists, and then add a new item to the list with `done: false`.

```js
function addItem(text) {
  let newDoc = Automerge.change(doc, doc => {
    if (!doc.items) doc.items = []
    doc.items.push({ text, done: false })
  })
  updateDoc(newDoc)
}
```

Because Automerge is functional, each document is immutable. `Automerge.change` does
not modify the document you pass in, but it returns a `newDoc` which reflects the
change you just made. We then call `updateDoc()` as defined
[in the last section](/docs/tutorial/create-a-document/) to update the global variable `doc` with
the latest document state. The old state of the document is not used anymore.

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
  addItem(input.value)
  input.value = null
}
```

Next, we have to render the items in the list every time an item is added.
