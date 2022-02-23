---
sidebar_position: 2
---
# Setup

We will build a small web app during this tutorial. This tutorial is designed to walk you through the basic concepts of Automerge so that you can use it in your own apps. For a deeper understanding and common patterns that you would likely need in a production application, see the [Cookbook](/docs/cookbook/modeling-data). You will find that these two resources are complementary.
 
## What you need to know

To complete this tutorial, we assume you have a working knowledge of HTML and JavaScript. If you're coming from another programming language, we've designed it to be simple enough that you should also be able to follow along.

## What are we building?

Today, you will build a simple todo list app with plain JavaScript. The resulting code from the tutorial will be less than 100 lines, and cover:

* Modeling a document's data model
* Making changes to documents
* Persisting state in IndexedDb to preserve the document after restarting the browser tab using [localforage](https://localforage.github.io/localForage/).
* Supporting real-time collaboration in the same browser using `BroadcastChannel`

## Setup

Create an `index.html` file that includes `automerge.min.js` and `index.js`.  

```html
<html>
    <body>
        <script type="application/javascript" src="https://cdn.jsdelivr.net/npm/automerge@1.0.1-preview.7/dist/automerge.min.js"></script>
        <script type="module" src="./index.js"></script>
    </body>
</html>
```

Create an `index.js` file. In this file, we will create our first document:

```js
let doc = Automerge.init()
console.log(doc)
```

Once you've saved index.js, open index.html in your browser. You can use your favorite http-server, for example: 

* `npx http-server` for Node, or 
* `python -m SimpleHTTPServer` for Python

With both of these files, you should be able to see some representation of the Automerge document in the console.

## React, vue, or package managers 

This tutorial uses vanilla JavaScript, but you can also use a package manager or framework if you'd like. For example, use `npm i automerge` and import Automerge like so:

```js
import * as Automerge from 'automerge'

let doc = Automerge.init()
console.log(doc)
```



