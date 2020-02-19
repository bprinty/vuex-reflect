# Relationships

Nested resource API designs are a commonly used pattern for providing contextualized data in a very readable way. Below are examples where a nested resource design can be used within an application:

```
/posts/:id/author   // author of post
/posts/:id/comments // all comments for single post
```

This library supports declaring those types of relationships in models via the `relationships()` configuration in Model definitions, allowing developers to access any number of nested Models from a model instance directly. The following code shows the data structure for declaring Model relationships:

```javascript
class MyRelatedModel extends Model { ... }

class MyModel extends Model {

  ...

  /**
   * Static method for declaring relationships to other Models.
   */
  static relationships() {
    return {
      /**
       * All todo items for a single author.
       */
      myRelatedModels: {
        /**
         * Method for casting data returned from fetch request.
         */
        type: Array,
        model: MyRelatedModel,
        url: '/authors/:id/posts',
      },
    }
  }

  ...
}
```

## Fetching Nested Resources

After declaring relationships, you can fetch the nested data using the `fetch()` method:

```javascript
const obj = MyModel.get(1) // get MyModel with id `1` from the store
obj.myRelatedModels.fetch().then((results) => {
  // use MyRelatedModel objects
});
```

This is particularly useful if you're working on a component specific to a single model, and you haven't fully fetched the data you need from other parts of the application. In this case, if we had a `Post` model that declared `Comments` as a relationship through a nested url like so:

```javascript
class Comment extends Model { ... }

class Post extends Model {
  static props() {
    return {
      title: '',
      body: '',
      author: {
        type: Author,
        collapse: 'author_id'
      }
    };
  }

  static relationships() {
    return {
      comments: {
        type: Array,
        model: Comment,
        fetch: '/posts/:id/comments',
      }
    }
  }
}
```

We could utilize that relationship in a component that takes a `Post` model as a property and displays both `Post` and related `Comment` data:

```html
<template>
  <h1>{{ post.$.name }}</h1>
  <small v-for="comment in post.comments" v-key="comment.id">{{ comment.$.text }}</small>
</template>
<script>
export default {
  name: 'my-component',
  props: {
    post: null,
  },
  data() {
    return {
      comments: [],
    }
  },
  created() {
    this.post.comments.fetch((result) => {
      this.comments = result;
    });
  }
}
</script>
```

## Accessing Data

If you don't wish to fetch related models via the API, you can pull directly from the store using `get()`, `all()`, or `$`. In this case, let's work with a `Post` model with nested API methods for retrieving `Author` and `Comment` data:

```javascript
class Author extends Model { ... }
class Comment extends Model { ... }

class Post extends Model {
  static props() {
    return {
      title: '',
      body: '',
    };
  }

  static relationships() {
    return {
      author: {
        array: false,
        model: Comment,
        url: '/posts/:id/comments',
      },
      comments: {
        model: Comment,
        url: '/posts/:id/comments',
      },
    };
  }
}
```

Using the definitions above, we can use the code below to query our nested models:

```javascript
Promise.all([
    Comments.fetch(),
    Author.fetch(),
    Post.fetch()
]).then(() => {  
  const post = Post.get(1); // get post with id `1`
  const postComments = post.comments.all(); // get all nested comments
  const postAuthor = post.author.get(); // get nested post author
});
```

> Note that relationships configured to use an array should use `all()` as the mechanism for retrieving related models. Other relationships should use `get()` as the mechanism for retrieving the related model data.

You can also access any related models already existing in the store directly using the Model `$` operator:

```javascript
post.$.comments // get all linked comments in the store
post.$.author // get linked author from the store
```
