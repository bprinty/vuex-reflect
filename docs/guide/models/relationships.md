# relationships

Nested resource API designs are a commonly used pattern for providing contextualized data in a very readable way. Below are examples where a nested resource design can be used within an application:

```
/posts/:id/author   // author of post
/posts/:id/comments // all comments for single post
/posts/:id/archive  // send POST request to archive post
/posts/:id/history  // send GET request to retrieve post history
```

This library supports declaring those types of relations in models via the `relations()` configuration in Model definitions, allowing developers to access any number of nested Models from a model instance directly. The following code shows the data structure for declaring Model relations:

```javascript
class MyRelatedModel extends Model { ... }

class MyModel extends Model {

  static api() { ... }

  /**
   * Static method for declaring relations to other Models.
   */
  static relations() {
    return {
      /**
       * Nested model.
       */
      relatedModel: {
        model: RelatedModel,
        url: '/mymodel/:id/relatedmodel',
      },
      /**
       * Nested collection of models.
       */
      relatedCollection: {
        collection: RelatedModel,
        url: '/mymodel/:id/relatedcollection',
      },
    }
  }

  static actions() {
    /**
    * Nested action for model.
    */
    relatedAction: {
      /**
       * Request method to use for action.
       */
      method: 'POST',
      /**
       * Whether or not to refresh the current model after
       * the action resolves.
       */
      refresh: true,
      /**
       * URL to use for nested action.
       */
      url: '/mymodel/:id/action',
    },
    /**
    * Nested query for model.
    */
    relatedQuery: {
      method: 'GET',
      url: '/mymodel/:id/query',
    },
  }

  ...
}
```

## Fetching Nested Resources

After declaring relations, you can fetch the nested data using the `fetch()` method:

```javascript
const obj = MyModel.get(1) // get MyModel with id `1` from the store
obj.relatedCollection.fetch().then((results) => {
  // use RelatedModel objects
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

  static relations() {
    return {
      comments: {
        collection: Comment,
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

You can also define different types of nesting when declaring `relations`. For example, if one of your nested urls returns a single model (`Author`) and one returns a collection of models (`Comments`), you can represent that declaratively via:

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

  static relations() {
    return {
      author: {
        model: Author,
        url: '/posts/:id/author',
      },
      comments: {
        collection: Comment,
        url: '/posts/:id/comments',
      },
    };
  }

}
```

Using the definitions above, we can use the code below to query our nested models:

```javascript
Promise.all([ Comments.fetch(), Author.fetch(), Post.fetch() ]).then(() => {

  // get post with id `1`
  const post = Post.get(1);

  // get nested post author
  post.author.fetch().then((result) = > {
    const postAuthor = result;
  });

  // get all nested comments
  post.comments.fetch().then((results) = > {
    const postComments = results;
  });

});
```

If you need to issue other types of requests for nested relations, you can do so with the same syntax you used for models:

```javascript
const post = Post.get(1);

// delete comments (sends DELETE request)
await post.comments.delete();

// delete comments (sends GET request)
const otherAuthor = Author.get(2);
await post.author.update(otherAuthor);

// create new post comment (issue POST request with nested data)
const comment = new Comment({ text: 'this is a comment' });
await post.comments.create(comment);
```

## Nested Actions

You can also define nested actions and queries that work within the context of your model. Let's add onto our example from above to include a nested action for `archive` (archiving a single post) and `history` (fetching historical data about a post):

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

  static relations() {
    return {
      author: {
        model: Author,
        url: '/posts/:id/author',
      },
      comments: {
        collection: Comment,
        url: '/posts/:id/comments',
      },
    };
  }

}

static actions() {
  return {
    archive: {
      method: 'POST',
      url: '/posts/:id/archive',
      refresh: true,
    },
    history: {
      method: 'GET',
      url: '/posts/:id/history',
    }
  }
}
```

You can use these actions on the `Post` model directly, and each will return a promise that resolves with the request data:

```javascript
const post = Post.query().one();

// archive post (will issue Post.get(id) to refresh post after result)
await post.archive();

// get history data
const history = await post.history();
```
