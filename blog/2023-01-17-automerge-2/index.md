---
slug: automerge-2
title: Automerge 2.0
authors: [pvh]
tags: []
---

# Automerge 2.0

Automerge 2.0 is here and ready for production. It’s the first supported release resulting from a ground-up rewrite. The result is a production-ready CRDT with huge improvements in performance and reliability. It's available in both Javascript and Rust, and includes Typescript types and C bindings for use in other ecosystems. Even better, Automerge 2.0 comes with improved documentation and, for the first time, support options for production users.

## Local-first Software

Since the rise of the cloud, developers have largely had to choose between building cloud software or traditional installed software. Although installed software has some reliability and performance benefits, cloud software has dominated the market. Cloud software makes implementing collaboration easy and includes ubiquitous access from any computing device. Unfortunately, the advantages of cloud software come at a significant price. Cloud software is fragile and prone to outages, rarely supports offline use, and can be prohibitively expensive to scale to large audiences.

At Ink & Switch, we’ve been researching a model for developing software which we call [local-first software](https://www.inkandswitch.com/local-first/), with the goal of combining the best of both worlds: reliable, locally-executed software paired with scalable offline-friendly collaboration infrastructure.

Over the last five years we’ve built a wide variety of prototypes, run research experiments, and worked with a number of production users to better understand the challenges of building local-first software. The central result of this work is the Automerge project.

## Automerge

Automerge is a JSON-like data structure that preserves history and can reliably merge edits from any other source. The combination of these two capabilities allows developers to easily support the kind of real-time collaboration expected by users today with native offline support.

It has a compact binary storage format, an efficient synchronization system, and is fast enough for production use.

## Reimplementing Automerge for Performance & Portability

Earlier versions of Automerge were implemented in pure JavaScript. Our initial implementations were theoretically sound but much too slow and used too much memory for most production use cases.

Furthermore, JavaScript support on mobile devices and embedded systems is limited. We wanted a fast and efficient version of Automerge that was available everywhere: in the browser, on any mobile device, and or even embedded devices like the ESP32.

As a result, we decided to rewrite Automerge in Rust. In the browser, Rust can be compiled to WebAssembly. It can also be used as a native library through bindings for other programming languages. 

The change should be mostly transparent for JavaScript users. We built a JS wrapper around the Rust core that provides a similar API to earlier versions of Automerge.

To create Automerge 2.0, lab members Alex Good and Orion Henry teamed up with Andrew Jeffrey, Jason Kankiewicz (as well as several other open source collaborators) to polish and optimize the Rust implementation and develop the JS wrapper. The result is a codebase that is hundreds of times faster, radically more memory efficient, and both better tested and more reliable.

:::caution

Please note that WebAssembly is not currently supported in React-Native applications. Our current plan is to implement native wrappers for Automerge on mobile devices. Please feel free to reach out if you are building mobile applications and would like to use Automerge.

:::

## Documenting Automerge

With Automerge 2.0 we've made a big investment in improving documentation. In addition to [sample code], we now have a [tutorial] and [quick-start guide] that support both Vite and create-react-app, as well as [internals] documentation, and [file format] documentation. This work was led by lab alumnus Rae McKelvey and we hope it helps make getting started with Automerge much easier. Please let us know if there are other topics or areas you'd like to see covered!


## Supporting Automerge

Those who have been following Automerge for a while may have noticed that we describe Automerge 2.0 as our first *supported* release. That’s because as part of the Automerge 2.0 release we’ve brought Alex Good onto the team full-time to provide support to external users, handle documentation and release management, and—of course—to continue implementing new Automerge features for the community.

This is a big moment for Ink & Switch and the Automerge project: we’re now able to provide support to our users thanks to sponsorship from enterprises like [Fly.io](https://fly.io/), [Prisma](https://www.prisma.io/), and [Bowtie](https://bowtie.works/) as well as so many others who have contributed either directly to Automerge or through supporting Martin Kleppmann on Patreon.

If your business is interested in sponsoring Automerge, please get in touch with us. Every little bit helps, and the more sponsors we have, the more work we can do while still remaining an independent open source project.

## Performance

One of the most challenging benchmarks for CRDTs is realtime text collaboration. A common benchmark for this task is a trace of the edits made in the process of writing an academic paper which can be found [here](https://github.com/automerge/automerge-perf). The particular implementation we used to run the benchmarks can be found [here](https://github.com/alexjg/automerge-perf-comparisons). Here's the TLDR, running on Alex's Ryzen 9 7900X. The "timing" column is how long it takes to apply every single edit in the trace, whilst the "memory" common is the peak memory usage during this process.

|        Benchmark         | Timing (ms) | Memory (bytes) |
| ------------------------ | ----------- | -------------- |
| Automerge 1.0            |       13052 |      184721408 |
| Automerge 2.0            |        4442 |      118263808 |
| Automerge 2.0.1          |        1816 |       44523520 |
| Automerge 2.0.1-unstable |         661 |       22953984 |
| Yjs                      |        1074 |       10141696 |

Note that this includes the results from `automerge 2.0.1`, which is not yet officially released but which you can try out by installing the "alpha" releases, usually labelled something like `automerge-2.0.1-alpha.n`. The "-unstable" refers to a new API for text we are working on. Also note that the "automerge 1.0" here is actually the `automerge@1.0.1-preview-7` release, which uses a similar architecture to the rust implementation, the speed and memory improvements are the result of using WebAssembly, rather than an architectural change. There _is_ a major architectural change from `automerge@1.0` though, `automerge@1.0` takes around 20 minutes to process the edit trace and uses multiple gigabytes of memory.

For automerge `2.0` we're still a little way behind Yjs in timings and our memory use is very high, but you can see we are making good progress on both fronts in `2.0.1`.


## Portability

In addition to the WASM/JS version of Automerge, we also have a number of users embracing using the Rust codebase directly, as well as a rapidly maturing C-bindings API designed and contributed by `jkankiewicz` that should make it easy to write native frontends for other languages. We’ve already seen the start of an `automerge-go` library, and we hope to provide bindings for other languages like Swift, Kotlin, and Python in the future.

# What’s Next

With the release of Automerge 2.0 out the door, we will of course be listening closely to the community about their experience with the release, but in the months ahead, we expect to work on at least some of the following features:

## Native Rich Text Support

As with most CRDTs, Automerge originally focused on optimizing editing of plain-text. In the [Peritext paper](https://www.inkandswitch.com/peritext/) by Ink & Switch we discuss an algorithm for supporting rich text with good merging accuracy, and we are planning to integrate this algorithm into Automerge. Support for rich text will also make it easier to implement features like comments or cursor and selection sharing.

## Improved Synchronization

While we are very proud of the round-trip efficiency of Automerge synchronization on a per-document basis, we see big potential to improve sync performance of many documents at once. We also expect to provide other optimizations our users and sponsors have requested, such as more efficient first-document loading, run-length encoding of related changes, and enabling something akin to a Git “shallow clone” in the case of clients which don’t often require access to a document’s history.

## Rust API Improvements

The current Rust API is powerful but low-level, and as we’ve watched our early adopter friends work with the API it has become clear to us what abstractions we can provide to make their lives easier via tools like type annotation.

## Branches

While we retain the full history of Automerge documents and provide APIs to access it, we don’t currently provide an efficient way to reconcile many closely related versions of a given document. This feature is particularly valuable for supporting offline collaboration in professional environments and (combined with Rich Text Support) should make it much easier for our friends in journalism organizations to build powerful and accurate editing tools.

## Automerge-Repo

We’ve worked hard to keep Automerge unopinionated and support a wide variety of deployment environments. We don’t require a particular network stack or storage system, and Automerge has been used successfully in both client-server web applications and peer-to-peer desktop software. Unfortunately, this technology-agnostic position has left a lot of the busy-work up to application developers, and asked them to learn a lot about distributed systems just to get started.

Our upcoming library, Automerge-Repo, is a modular batteries-included approach to building web applications with Automerge. It works both in the browser (desktop and mobile) and in Node, and supports a variety of networking and storage adapters. There are even text editor bindings for Quill and Prosemirror as well as React Hooks to make it easy to get started quickly.

We’re using it for some internal projects already, so expect more news soon, and feel free to get in touch if you’d like to be an early tester.

# Conclusion

Automerge 2.0 is here, it’s ready for you, and we’re tremendously excited to share it with you. We’ve made Automerge faster, more memory efficient, and we’re bringing it to more platforms than ever. We’re adding features, making it easier to adopt, and have begun growing a team to support it. There has never been a better moment to start building local-first software: why not [give it a try](https://automerge.org/docs/hello/)?
