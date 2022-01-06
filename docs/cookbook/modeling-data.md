---
sidebar_position: 1
---

# Modeling Data

All data in Automerge must be stored in a document. A document can be modeled in a variety of ways, and there are many design patterns that can be used. An application could have many documents, typically identified by a UUID. 

In this section, we will discuss how to model data within a particular document, including how to version and manage data with Automerge in production scenarios.

## How many documents?

A first question you might ask is how granular a document should be. One major automerge project, https://github.com/automerge/pushpin, was built around very granular documents. This had a lot of benefits, but the overhead of syncing many thousands of documents was high. One of the first challenges in synchronizing large numbers of documents is that nodes are likely to have overlapping but disjoint documents and neither side wants to disclose things the other doesn't know about (at least in our last system, knowing the ID of a document was evidence a client should have access to it.) 

We believe on the whole there's an art to the granularity of data that is universal. When should you have two JSON documents or two SQLite databases or two rows? We suspet that an automerge document is best suited to being a unit of collaboration between two people or a small group. For more about how these UUIDs can be used intelligently for authentication and document access as a unit of collaboration, see [Authentication](authentication).

## Schemas

Given that you have a document, how can you create safety rails for it's data integrity? In a typical SQL database, a table would have it's own schema which is unchanged. Automerge is flexible on the schema, and will let you add and remove properties and values at will. If you'd like more control, a Document can be typed to have it's own schema using TypeScript.

To create a typed document, you can create a root change that two documents share. This provides some enforcement of the initial schema, since all resulting documents will have to conform to the type. This is also useful in the case where two users could start making changes before the 'initiator' of the document is able to connect. Chat, text and counters are good examples of this.

To create an initial root change for your Automerge document, you must make a change that has the same hash every time it is created. We do this by setting the actorId to a static string `'0000'` and setting the time to always be 0.

```js
let doc = Automerge.init('0000', {time: 0})
```

We then modify this document to create the initial values for all of the types in the document.

```js
type D = { 
  count: Automerge.Counter,
  text: Automerge.Text,
  cards: [] 
}
let schema = Automerge.change<D>(Automerge.init('0000', {time: 0}), (doc: D) => {
  doc.count = new Automerge.Counter()
  doc.text = new Automerge.Text()
  doc.cards = []
})
```

Great, now we have an initial document that represents the base schema of our data model. But because we initialized this Automerge document with a fixed actorId, we need to create a new document that has a random id. We don't want all of our resulting changes to be with the actorId `0000`, because that should be reserved for the initial change only.

```js
let change = Automerge.getLastLocalChange(schema)
const [ doc , ]= Automerge.applyChanges(Automerge.init<D>(), [change])
```

Now, `doc` is initialized and ready to be used as any other Automerge document. You can save that document to disk as you would normally with `Automerge.save(doc)` and load it later when your app starts.

> NOTE: You only have to create the initial change that the first time the document loads. You can check if you have a local document yet for that id.

## Versioning

Often, there comes a time in the production lifecycle where you will need to change the schema of a document. Because Automerge uses a JSON document model, it's similar to a NoSQL database, where properties can be arbitrarily removed and added at will. 

However, we strongly recommend versioning your documents from the beginning. This allows you to detect older document versions and migrate those documents to newer versions on the fly. 

The following will not work, for example, because you're passing the same beforeDoc into applyChanges more than once (the second time you do that will throw an exception).


## Normalization

??

## Performance

Automerge documents hold their entire change histories. It is fairly performant, and can handle a significant amount of data in a single document's history.  Performance depends very much on your workload, so we strongly suggest you do your own measurements with the type and quantity of data that you will have in your app. 

Some developers have proposed “garbage collecting” large documents. If a document gets to a certain size, a central authority could emit a message to each peer that it would like to reduce it in size and only save the history from a specific change (hash). Martin Kleppman did some experiments with a benchmark document to see how much space would be saved by discarding history, with and without preserving tombstones. See [this video at 55 minutes in][(https://youtu.be/x7drE24geUw?t=3289)]. The savings are not all that great, which is why we haven't prioritised history truncation so far.

Typically, performance considerations can come at the storage or the networking level. In general, having fewer documents that a client must load into memory at any given time will reduce the amount of memory usage and startup time for your application. Automerge's binary format is very efficient, and uses the same data representation in memory as on disk. In general, storing any data you get from the network into the local filesystem, and loading documents from the filesystem first will improve the perceived performance of your program.


BENCHMARKS>?