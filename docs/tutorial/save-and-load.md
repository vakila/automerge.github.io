---
sidebar_position: 6
---
# Save and load

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

In a production app, you will probably want to use randomly generated ids, because that would be harder to guess and more secure. However, having a user-generated ID is fine for our prototype.

## Load

When the page loads, you can check to see if you have a stored document for the document ID in the URL. You can then load and render that document like this:

```js
let docId = window.location.hash.replace(/^#/, '')
let binary = await localforage.getItem(docId)
let doc = Automerge.init()

if (binary) {
  doc = Automerge.load(binary)
  render(doc)
}
```

## Save

Every time the document changes, we can save the document. We can do this by adding the code for saving to the `updateDoc()` function:

```js
function updateDoc(newDoc) {
  doc = newDoc
  render(newDoc)
  let binary = Automerge.save(newDoc)
  localforage.setItem(docId, binary).catch(err => console.log(err))
}
```

Now you can add some items to the list and refresh the browser tab, and the items won't disappear.
