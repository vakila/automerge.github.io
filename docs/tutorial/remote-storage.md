---
sidebar_position: 8
---

# Remote storage

One of the key problems in local-first applications is how to save data on a remote device so it can be retrieved by collaborators. For example, if I add items to the todo list and shut my laptop, I want other people to be able to see my new changes while I'm offline.

There are many ways to do this. One option is to have a server peer which behaves similarly to a client peer, but is always online. This server peer can participate in the sync protocol over WebSockets, and you can use the Rust, Node.js, Python, or C Automerge libraries on the server side. It can even store these intermediate changesets in a database like MongoDB.

In this tutorial we will offer a simpler solution based on file storage. 

## File

```Automerge.save(doc)``` is a powerful tool. It serializes the Automerge document history into a compact binary format. This binary format can be saved as a file, and sent to a server, downloaded to the filesystem, put on a USB stick, or sent over email. 

To do this in our tutorial, let's create a server in Node.js that has to HTTP routes: GET and PUT a file with a docId.

## File server

Here is a gist that will give you a basic server you can use in this demo

```
git clone https://gist.github.com/8577a591087f1818097da868c84c992c.git
npm i 
```

Or, copy and paste this file to `server.js` and install the related dependencies (the npm packages [express](https://www.npmjs.com/package/express), [body-parser](https://www.npmjs.com/package/body-parser), and [cors](https://www.npmjs.com/package/cors)).

```js
const express = require('express')
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const bodyParser = require('body-parser')

let app = express()
var options = {
	inflate: true,
	limit: '100kb',
	type: 'application/octet-stream'
}
app.use(bodyParser.raw(options))

try { 
	fs.mkdirSync(path.join(__dirname, 'data'))
} catch (err) {
	if (err.code !== 'EEXIST') {
		console.error(err)
	} 
}

app.use(cors())

app.get('/:id', (req, res) => {
	let id = req.params.id
	let filename = path.join(__dirname, 'data', id)
	fs.stat(filename, (err, stats) => {
		if (err) {
			console.error(err)
			res.status(404).send('Not found')
		} else { 
			res.sendFile(filename)
			console.log('sending')
		}
	})
})

app.post('/:id', (req, res) => {
	let id = req.params.id
	fs.writeFileSync(path.join(__dirname, 'data', id), req.body)
	res.status(200).send('ok')
})

const port = 5000

app.listen(port, () => {
	console.log('listening on http://localhost:' + port)
})
```

## Uploading files

You can then serialize the Automerge document to a binary and send it to the fileserver. Call this function in your `observer.observe` function so that the file is saved to the remote every time you make a change.

```js
function saveToRemote (docId, doc) {
  let binary = Automerge.save(doc)
  return fetch(`http://localhost:5000/${docId}`, {
    body: binary,
    method: "post",
    headers: {
      "Content-Type": "application/octet-stream",
    }
  })
}
```

## Download files

When you load the application for the first time, you want to get the item from the remote server and merge those changes locally. Automerge BinaryDocuments must be an `arrayBuffer`.

```js
async function loadFromRemote (docId) {
  const response = await fetch(`http://localhost:5000/${docId}`)
  if (response.status !== 200) throw new Error('No saved draft for doc with id=' + docId)
  const respbuffer = await response.arrayBuffer()
  if (respbuffer.byteLength === 0) throw new Error('No saved draft for doc with id=' + docId)
  const view = new Uint8Array(respbuffer)
  return Automerge.load(view)
}
```

## Exercise

There is a bug in our implementation. There is a **race condition**: if two devices are uploading the document in rapid succession, they could override each other's files in the remote storage server, resulting in the server copy containing one or the other's edits, but not the merged set of both users' edits. 

Modify the server to remove this race condition. Before overriding a local file, the server should check the local filesystem for an existing copy. Use `Automerge.merge` on the incoming and local file before saving it to disk.

**Hints**

There are multiple ways to solve this problem, and it's very open ended. You could also solve this on the client, by fetching files and merging with them before saving to the server.

In this experimental [React demo](https://github.com/alexjg/automerge-todomvc-http), you can see how a python fileserver can be used to store Automerge files. You could also use a Cloud service like Amazon S3 or Digital Ocean Spaces as a remote storage location. 
