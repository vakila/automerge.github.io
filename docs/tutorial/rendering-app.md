---
sidebar_position: 5
---

# Rendering the app

When you add a new item to the list, you want to see that item immediately be populated in the list.

Let's render the items in our todo list:

```html
<ul id="todo-list">
</ul>
```

```js
function render(doc) {
  let list = document.querySelector("#todo-list")
  list.innerHTML = ''
  doc.items && doc.items.forEach((item, index) => {
    let itemEl = document.createElement('li')
    itemEl.innerText = item.text
    itemEl.style = item.done ? 'text-decoration: line-through' : ''
    list.appendChild(itemEl)
  })
}
```

Next, let's change the `updateDoc()` function to re-render the todo list every time the Automerge document is updated:

```js
function updateDoc(newDoc) {
  doc = newDoc
  render(newDoc)
}
```

Now you should be able to type something in the text box, hit enter, and you should see it appear on the list!

## Exercise 

Now, your turn. Write the next function we will need: to mark a todo as complete
(or incomplete). To do this, we need the index of the todo item in the list.

```js
function toggle(index) {
  let newDoc = Automerge.change(doc, (doc) => {
    // your code here
  })
  updateDoc(newDoc)
}
```

Then, attach this function to the DOM `itemEl.onclick` event.

**Hints**

You can use `doc.items[index]` to get the value of the item in the list. This value can be manipulated inside a call to `Automerge.change`.

You cannot use `...` when updating a Automerge document. For example, the following **will not work**:

```js
Automerge.change(doc, doc => {
  doc.items = [...doc.items, toggledItem]
})
```

Instead, to add an item to a list, you need to use `doc.items.push(item)` inside `Automerge.change` to add to the end of the list. You can also use `doc.items.unshift(item)` to add an item to the beginning, or `doc.items.insertAt(index, item)` to add an item at any index.
