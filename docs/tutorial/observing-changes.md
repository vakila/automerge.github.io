---
sidebar_position: 5
---

# Observing changes

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

But there's a problem: every time you add an item to the list, it doesn't update the list dynamically. So, we need to *observe* or *subsribe* to changes, so that we can re-render the user interface every time a change is made to the document. For this, we use an `Automerge.Observable`.


## Automerge.Observable

An observer is created separately from the document, and is passed to `Automerge.init`. 

```js
let observable = new Automerge.Observable()
let doc = Automerge.init({ observable })
```

We can then use the observer to watch for changes, and re-render the user interface with the new document state.

```js
observable.observe(doc, (diff, before, after, local, changes) => {
  // after is the new document state!
  render(after)
})
```

The observer callback is called before the `doc` is changed. Use `after` for rendering the new state of the app.

You can also apply observables to properties on the Automerge document.

```js
observable.observe(doc.items, (diff, before, after, local, changes) => {
  // before == '[]'
  // after == '['Cat food']'
})

doc = Automerge.change(doc, doc => doc.items.push('Cat food'))
```


## Object IDs

Now, every time you add an item, the list should refresh and add it to the list. To do this, we use `Automerge.getObjectId`. Every property, or object, on the Automerge document is given it's own unique identifier which can be helpful for making sure we only render each object once.

```js
let list = document.querySelector("#todo-list")

function render (doc) {
    doc.items && doc.items.forEach((item, index) => {

        // the object id is unique
        let objId = Automerge.getObjectId(item)
        let itemEl = document.getElementById(objId)

        if (!itemEl) {
            itemEl = document.createElement('li')
            itemEl.innerHTML = item.value

            // give the item the object id so we only add it to the DOM once
            itemEl.setAttribute("id", objId)
            itemsDiv.appendChild(itemEl)
        }

        // if the item is marked done, show it with a strikethrough
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

You can use `doc.items[index]` to get the value of the item in the list. This value can be manipulated inside a call to `Automerge.change`.

You cannot use `...` when updating a Automerge document. For example, the following **will not work**:

```js
Automerge.change(doc, doc => {
  doc.items = [...doc.items, toggeledItem]
})
```

Instead, to add an item to a list, you need to use `doc.items.push(item)` inside `Automerge.change` to add to the end of the list. You can also use `doc.items.unshift(item)` to add an item to the beginning, or `doc.items.insertAt(index, item)` to add an item at any index.
