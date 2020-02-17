# Customization

Talk about how models can further be customized with new methods and actions for doing various things - use /todos/:id/done POST action as example.

```javascript
class Todo extends Model {

  // SOMETHING LIKE BELOW, MAYBE CLEANED UP
  static actions() {
    return {
      done: '/posts/:id/done',
      not: {
        url: '/posts/:id/done',
        payload() {
          return {
            done: true,
          }
        }
      }
    };
  }

  closeTodo() {
    return this.post('/posts/:id/done')
  }

  getDoneTodos() {
    return this.get('/posts/:id/done')
  }

  fetchDoneTodos() {
    return this.fetch('/posts/:id/done')
  }

  getStatus() {
    return this.get('/posts/:id/status')
  }

}

```
