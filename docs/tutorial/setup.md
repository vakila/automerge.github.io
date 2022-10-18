---
sidebar_position: 2
---

# Setup

We will build a small web app during this tutorial. This tutorial is designed to walk you through the basic concepts of Automerge so that you can use it in your own apps. For a deeper understanding and common patterns that you would likely need in a production application, see the [Cookbook](/docs/cookbook/modeling-data/). You will find that these two resources are complementary.
 
## What you need to know

To complete this tutorial, we assume you have a working knowledge of HTML and JavaScript. If you're coming from another programming language, we've designed it to be simple enough that you should also be able to follow along.

## What are we building?

Today, you will build a simple to-do-list app with plain JavaScript. The resulting code from the tutorial will be less than 100 lines, and cover:

* Modeling application state using an Automerge document
* Making changes to documents
* Persisting state in IndexedDB to preserve the document after restarting the browser tab (using [localForage](https://localforage.github.io/localForage/))
* Supporting real-time collaboration in the same browser (using [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel))

## Setup

Because automerge is backed by a WebAssembly package we will need a bundler, we'll be using WebPack.

First we get a basic webpack site off the ground:

```bash
mkdir automerge-todo
cd automerge-todo
yarn init -y
yarn add webpack webpack-dev-server webpack-cli @automerge/automerge
```

Create a file called `webpack.config.js` with the following contents

```javascript
const path = require('path');

module.exports = {
  experiments: { asyncWebAssembly: true },
  target: 'web',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public'),
  },
  mode: "development", // or production
  performance: {       // we dont want the wasm blob to generate warnings
     hints: false,
     maxEntrypointSize: 512000,
     maxAssetSize: 512000
  }
};
```


Create a `public/index.html` file that contains the following:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Getting Started</title>
  </head>
  <body>
    <script src="main.js"></script>
  </body>
</html>
```

Create a `src/index.js` file. In this file, we will create our first document:

```javascript
import * as Automerge from "@automerge/automerge"
let doc = Automerge.init()
console.log(doc)
```

Now run `yarn webpack serve` and go to `http://localhost:8080`
