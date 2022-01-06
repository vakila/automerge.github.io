
# Table

`Automerge.Table` provides a collection datatype that is similar to a table in a relational
database. It is intended for a set of objects (_rows_) that have the same properties (_columns_ in a
relational table). Unlike a list, the objects have no order. You can scan over the objects in a
table, or look up individual objects by their primary key. An Automerge document can contain as many
tables as you want.

Each object is assigned a primary key (a unique ID) by Automerge. When you want to reference one
object from another, it is important that you use this Automerge-generated ID; do not generate your
own IDs.

You can create new tables and insert rows like this:

```js
let database = Automerge.change(Automerge.init(), doc => {
  doc.authors = new Automerge.Table()
  doc.publications = new Automerge.Table()
  // Automerge.Table.add() inserts a new row into the database
  // and returns the primary key (unique ID) of the new row
  const martinID = doc.authors.add({ surname: 'Kleppmann', forename: 'Martin' })
  // Adding a publication that references the above author ID
  const ddia = doc.publications.add({
    type: 'book',
    authors: [martinID],
    title: 'Designing Data-Intensive Applications',
    publisher: "O'Reilly Media",
    year: 2017
  })
})
```

You can read the contents of a table like this:

```js
// Array of row objects
database.publications.rows
// Array of row IDs (primary keys)
database.publications.ids
// Looking up a row by primary key
database.publications.byId('29f6cd15-61ff-460d-b7fb-39a5594f32d5')
// Number of rows in the table
database.publications.count
// Like "SELECT * FROM publications WHERE title LIKE 'Designing%'"
database.publications.filter(pub => pub.title.startsWith('Designing'))
// Like "SELECT publisher FROM publications"
database.publications.map(pub => pub.publisher)
```

You can modify rows in a table like this:

```js
database = Automerge.change(database, doc => {
  // Update a row
  let book = doc.publications.byId('29f6cd15-61ff-460d-b7fb-39a5594f32d5')
  book.isbn = '1449373321'
  // Delete a row
  doc.publications.remove('29f6cd15-61ff-460d-b7fb-39a5594f32d5')
})
```

Note that currently the `Automerge.Table` type does not enforce a schema. By convention, the row
objects that you add to a table should have the same properties (like columns in a table), but
Automerge does not enforce this. This is because different users may be running different versions
of your app, which might be using different properties.
