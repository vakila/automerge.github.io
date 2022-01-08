---
sidebar_position: 5
---

# Observing changes

When you add a new item to the list, you want to see that item immediately be populated in the list.

Let's render the items in our todo list:

```html
<div id="todo-list">
</div>
```

```js
let list = document.querySelector("#todo-list")

function render (doc) {
    doc.items && doc.items.forEach((item, index) => {
        let itemEl = document.createElement('li')
        itemEl.innerHTML = item.value
        itemEl.style = item.done ? 'text-decoration: line-through' : ''
    })
}
```

But there's a problem: every time you add an item to the list, it doesn't update the list dynamically. So, we need to *observe* or *subsribe* to changes, so that we can re-render the user interface every time a change is made to the document. For this, we use an `Automerge.Observer`.

An observer is created separate from the document, and is passed to `Automerge.init`. 

```js
let observer = Automerge.Observer()
let doc = Automerge.init({ observer })
```

We can then use the observer to watch for changes, and re-render the user interface with the new document state.

```js
observer.observe((diff, before, after, local, changes) => {
    // after is the new document state!
    render(after)
})
```

Now, every time you add an item, the list should refresh and add it to the list. However, there's one more problem -- unless you're using a framework. We need to give each item an id and check to see if the item is already rendered before rendering it again.

To do this, we use `Automerge.getObjectId`. Every property, or object, on the Automerge document is given it's own unique identifier which can be helpful for reducing the rendering time for large numbers of items.

```js
let list = document.querySelector("#todo-list")

function render (doc) {
    doc.items && doc.items.forEach((item, index) => {
        let objId = Automerge.getObjectId(item)
        let itemEl = document.getElementById(objId)
        if (!itemEl) {
            itemEl = document.createElement('li')
            itemEl.innerHTML = item.value
            itemEl.setAttribute("id", objId)
            itemsDiv.appendChild(itemEl)
        }

        itemEl.style = item.done ? 'text-decoration: line-through' : ''
    })
}
```

## Exercise 

Now, your turn. Write the next function we will need: to mark a todo as complete
(or incomplete). To do this, we need the index of the todo item in the list.

```js
function toggle (doc, index) {
  return Automerge.change(doc, (doc) => {
    // your code here
  });
}
```

Then, attach this function to the DOM `itemEl.onclick` event.

**Hints**

You can use `doc.items[index]` to get the value of the item in the list. This value can be manipulated.

You cannot use `...` to create changes to Automerge documents. For example, the following won't work:

```js
Automerge.change(doc, doc => {
  doc.cards = [...doc.cards, newItem],
}
```