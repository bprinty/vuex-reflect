# Querying

Once data are fetched by this library, they are automatically reflected onto the frontend store and available to access throughout the application.

The [ORM](/guide/models/querying.md) provided by this module has several methods designed to make querying data from the store a simpler process with minimal boilerplate. If developers choose to not use the ORM with this module, they can still query data, but must define their own mechanisms for filtering the data.

::: tip

If you plan on doing a lot of complex querying throughout your application, it is recommended you use the ORM for defining models, because it will produce a more readable and maintainable code base.

:::

The examples below mirror some of the examples in the ORM guide, but for querying store data directly:

```javascript
// filter
state.todos.filter(obj => obj.done)
state.todos.filter(obj => /contains text/.test(obj.text))

// has
state.todos.filter(obj => 'text' in obj)[0]

// all
state.todos

// first
state.todos[0]
state.todos.slice(0, 5)

// last
state.todos[state.todos.length - 1]
state.todos.slice(state.todos.length - 5, state.todos.length)

// random
_.sample(state.todos, 1)

// sample
_.sample(state.todos, 20)

// count
state.todos.filter(obj => obj.done).length

// sum/min/max
_.sum(state.todos.filter(obj => obj.done).map(obj => obj.priority))
_.min(state.todos.filter(obj => obj.done).map(obj => obj.priority))
_.max(state.todos.filter(obj => obj.done).map(obj => obj.priority))

// limit/offset
state.todos.slice(50, 100)

// order
[...arr].sort((a, b) => a.text > b.text)[state.todos.length - 1]
[...arr].sort((a, b) => a.id > b.id)[state.todos.length - 1]
```
