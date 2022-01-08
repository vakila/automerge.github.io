---
sidebar_position: 6
---
# Save and Load

One of the more important things people expect in an app is that if they refresh the browser tab, their todo list won't disappear. To do this, we must serialize the Automerge document into a format that can be saved on disk. You could use anything, from localStorage to MongoDB to the filesystem to store these Automerge binaries.

In this example, we will use [localforage](https://localforage.github.io/localForage/), a cross-browser polyfill that makes it easy to store binary arrays in the browser.

## Add localforage

First, add the script tag for [localforage](https://localforage.github.io/localForage/) to your index.html:

```html
<script 
	type="application/javascript" 
	src="https://raw.githubusercontent.com/mozilla/localForage/master/dist/localforage.min.js">
</script>
```

## Document Ids

Until now, your application has only one document. Now, you can assign a document id to retrieve the todo list and have multiple todo lists. This document id can be saved and transmitted in the URL of the website.

```js
let docId = window.location.hash
```

The hash is not transmitted to the domain as part of the url path. We can access the hash in the browser client as a unique identifier. For example, if you want to make a new todo list called 'groceries', the URL would be:

`http://localhost:8080/#groceries` 

In a production app, you would want to use randomly generated UUIDs, but having a user-generated id is fine for our tutorial.

## Load

When a document loads, you can check to see if you have a copy of that document id locally before initializing a new Automerge document.

```js
let docId = window.location.hash
let binary = await localforage.getItem(docId)

if (binary) {
	doc = Automerge.load(binary);
} else {
	doc = Automerge.init()
}
```

## Save

Every time the document changes, we can save the document using this pattern:

```js
let docId = window.location.hash
let binary = Automerge.save(doc)
localforage.setItem(docId, doc).catch(err)
```

## Exercise

Every time the document is changed, save it in localforage. You can do this by calling `Automerge.save` every time the document changes as part of the callback to `observer.observe`.

You'll know you did it correctly if you can add some items to the list and refresh the browser, and the items don't disappear.