# Customization

Since developers declare frontend models as classes, it's easy to add methods to those classes for performing common model operations.

To illustrate this property, let's use two examples in the context of a todo list application:

1. We need
2. We also would like our browser to export data for the todo item when a use exports a button


For example, if we're working on a todo list application with nested API actions like:

```
POST /todos/:id/done
```

For closing a todo item.



Talk about how models can further be customized with new methods and actions for doing various things - use /todos/:id/done POST action as example.

```javascript
class Todo extends Model {

  ...

  closeTodo() {
    return this.axios.post('/todos/:id/done')
  }

  exportTodo() {
    // frontend code for exporting todo
    return
  }

}

```

Putting it all together, we can craft a component using these methods:

```html
<template>
  <p>{{ todo.$.text }}</p>
  <button @click="todo.closeTodo">Close</button>
  <button @click="todo.exportTodo">Export</button>
</template>
<script>
export default {
  name: 'todo-item',
  props: ['todo'],
}
</script>
```


But as with any enabling feature, there is a balance that developers should seek to reach with other API functions. Developers should be cognizant about differentiating functionality provided by models and functionality provided by broader application functions.

And although it's not recommended for most use-cases, you can also overwrite any of the methods available by default on Model objects.
