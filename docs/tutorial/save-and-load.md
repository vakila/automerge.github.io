---
sidebar_position: 6
---
# Save and Load

One of the most important things people expect in an app is that if they refresh the browser tab, their todo list won't disappear. To do this, we must serialize the Automerge document into a format that can be saved on disk. You could use anything, from localStorage to MongoDB to the filesystem to store these Automerge binaries.

In this example, we will use [localforage](https://localforage.github.io/localForage/), a cross-browser polyfill that makes it easy to store binary arrays in the browser.

## Add localforage

First, add the script tag for [localforage](https://localforage.github.io/localForage/) to your index.html:

```html
<script type="application/javascript" src="https://cdn.jsdelivr.net/npm/localforage"></script>
```

## Document IDs

Until now, your application has only one document. Now, you can assign a document id to retrieve the todo list and have multiple todo lists. This document id can be saved and transmitted in the URL of the website.

```js
let docId = window.location.hash.replace(/^#/, '')
```

We can access the hash in the browser client as a unique identifier. For example, if you want to make a new todo list called 'groceries', the URL would be:

`http://localhost:8080/#groceries` 

In a production app, you will probably want to use randomly generated ids, because that would be harder to guess and more secure. However, having a user-generated id is fine for our prototype.

## Load

When a document loads, you can check to see if you have a copy of that document id locally before initializing a new Automerge document.

```js
let docId = window.location.hash.replace(/^#/, '')
let binary = await localforage.getItem(docId)
let observable = new Automerge.Observable()
let doc

if (binary) {
  doc = Automerge.load(binary, { observable })
  render(doc)
} else {
  doc = Automerge.init({ observable })
}
```

## Save

Every time the document changes, we can save the document using this pattern:

```js
let binary = Automerge.save(doc)
localforage.setItem(docId, binary).catch(err => console.log(err))
```

## Exercise

Every time the document is changed, save it in localforage. You can do this by calling `Automerge.save` as part of the callback to `observer.observe(doc, cb)`.

You'll know you did it correctly if you can add some items to the list and refresh the browser, and the items don't disappear.
