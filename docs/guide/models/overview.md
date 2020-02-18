# Overview

Let's take a top-down approach to understanding how models work with Vuex Reflect. Throughout this section of the documentation, let's focus on building a content management application with two related models: `Posts` and `Authors`. Using the ORM from this library, we want to define Models to help us traverse our data and reflect a backend API. Additionally, we'll be defining relationships between our Models. First, let's start with `Author`. The API providing `Author` data has the following endpoints:

```
/authors
  GET - Query all or a subset of authors.

/authors/:id
  GET - Get the metadata for a single author.
  PUT - Update data for a single author.

/authors/:id/posts
  GET - Query all or a subset of posts for a single author.
```

> Note that a targeted endpoint exists `/authors/:id/posts` for querying all posts for a specific author. This can be represented in our Model definition via `relationship()` configuraton.

The `Author` records from this API take the shape:

```javascript
// GET /authors
[
  { id: 1, name: 'Jane Doe', email: 'jane@doe.com' },
  { id: 2, name: 'John Doe', email: 'john@doe.com' },
  ...,
]
```

Now that we understand the data involved, let's define our `Author` model:

```javascript
import v from 'validator';

class Author extends Model {

  /**
   * API config for fetching and updating data.
   */
  static api() {
    return {
      query: '/authors',
      get: '/authors/:id',
      update: '/authors/:id',
    };
  }

  /**
   * Property definitions for the model.
   */
  static props() {
    return {
      /**
      * Author name.
      */
      name: {
        default: null,
        required: true,
        type: String,
      },
      /**
      * Author email.
      */
      email: {
        default: null,
        type: String,
        validation: {
          check: v.isEmail,
          message: '`${value}` is not a valid email.',
        },
      },
    };
  }

  /**
   * Relationships to other objects tracked by the orm.
   */
  static relationships() {
    return {
      /**
       * All todo items for a single author.
       */
      todos: {
        type: Array,
        model: Post,
        url: '/authors/:id/posts',
      },
    }
  }
}
```

Let's unpack some parts of the `Author` definition from above:

1. This library provides granularity over what endpoints are used during specific types of API actions. The [API](/guide/models/api.md) subsection has more details on all available actions.
2. Properties can define (in a declarative way) rules for mutating and validating data during updates. The [Properties](/guide/models/properties.md) subsection has more information on these rules.
3. Relationships between models where data can be fetched via API can be defined using the `relationships()` static method. The [Relationships](/guide/models/relationships.md) subsection has more information on how to configure these data links.

Now that we've defined our `Author` Model, let's define our `Post` Model. The API providing `Post` data has the following endpoints:

```
/posts
  GET - Query all or a subset of authors.

/posts/:id
  GET - Get the metadata for a single post.
  PUT - Update data for a single post.
  DELETE - Delete a specific post.
```

The `Post` records from this API take the shape:

```javascript
// GET /posts
[
  {
      id: 1,
      title: 'Post 1',
      body: 'This is the text for post 1',
      author: {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@doe.com'
      },
  },
  {
      id: 2,
      title: 'Post 2',
      body: 'This is the text for post 2',
      author: {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@doe.com',
      },
  },
  ...,
]
```

Note that `Post` data from the API contains nested information about related `Author` data. This is a commonly used pattern in web development, and the ORM from this library is built to support that pattern accordingly (by saving nested `Author` objects in the Vuex store automatically).

In the `Post` model definition below, note how the nested `Author` configuration is represented as an entry in the `props()` definition:

```javascript
class Post extends Model {

  /**
   * API config for fetching and updating data.
   */
  static api() {
    return {
      create: '/posts',
      query: '/posts',
      update: '/posts/:id',
    };
  }

  /**
   * Property definitions for the model.
   */
  static props() {
    return {
      /**
      * Post title.
      */
      title: {
        default: 'My Post Title',
        required: true,
        type: String,
      },
      /**
      * Post body
      */
      body: {
        type: String,
        mutation: value => `<div>${value}</div>`,
      },
      /**
      * Linked post author.
      */
      author: {
        type: Author,
        collapse: 'author_id',
      },
    };
  }
}
```

Once these models have been defined, you can use them throughout your application. As a quick example, let's take a look at a component that interacts with data from the `Post` model. In this component, you'll see that we need to first fetch the data before using it in the component.

```javascript
// JavaScript portion of Post Feed component.
export default {
  name: 'post-feed',
  created() {
    Post.fetch()
  },
  computed() {
    allPosts() {
      return Post.query().all();
    },
    shortPosts() {
      return Post.query.filter((x) => { x.body.length < 200 }).all();
    },
  },
}
```

This hints at an important principle you need to understand when using this library: the ORM **will only query data currently in the store**. It's up to developers to ensure that their store is in-sync with the data they want to have available. Fetching data from the API and into the store is easily done with `Model.fetch()`.

The [Store](/guide/store/overview.md) section provides more detail about how data flow into and out of the store. Technically, you don't even need models to use the API reflection functionality provided by this library. All Models in this module use getters and mutations from the store when accessing data.

As alluded to above, once data have been fetched and added to the frontend store, you can query and interact with those data:

```javascript
const post = Post.get(1); // get post by id

post.title // get author
post.author.email // get author email
```

And since author data was embedded in the `Post` fetch, you can also access `Author` data from the store without fetching authors:

```javascript
const author = Author.get({email: 'john@doe.com'})

author.name // get author name
author.posts[0].title // get first post available for author (in store)
```

Creating a new object is as easy as:

```javascript
const obj = new Post({ title: 'my-post', body: 'This is a post.', author: author })
```

Once objects are created, they aren't initially saved to the store or the backend. To issue a `create` action that will `POST` data to the API and update the store, you'll need to use `Model.commit()`:

```javascript
// Create new object
const obj = new Post({ title: 'my-post', body: 'This is a post.', author: author });

// Check out property values
obj.title // 'my-post' -- local version of data has been set
obj.$.title // null -- data hasn't been committed to store

// Commit data to backend and save result in Vuex store.
obj.commit().then((result) => {
  result.title // 'my-post' -- local version of data is set
  result.$.title // 'my-post' -- store version of data is set after request
});
```

If you remember from above, the `author` property was set to be a linked instance of the `Author` model. In the `property` definition for `author` above, we set the `collapse` property to `author_id`. The effect of this is collapsing that linked model into a single property in the `POST` payload:

```javascript
// POST /posts
{
  title: 'my-post',
  body: 'This is a post',
  author_id: 1,
}
```

Without setting the `collapse` property, the full `Author` json is sent in the request:

```javascript
// POST /posts
{
  title: 'my-post',
  body: 'This is a post',
  author: {
    id: 1,
    name: 'Jane Doe',
    email: 'jane@doe.com',
  },
}
```

This overview covered several of the high-level features provided by this library, and you can find more information about each of the concepts alluded to above in these subsections:

1. [API](/guide/models/api.md) - Information about configuring API endpoints for fetching, updating, and querying data.
1. [Properties](/guide/models/properties.md) - Information about declaring model properties, along with mechanisms for validation and property mutations.
1. [Relationships](/guide/models/relationships.md) - Information about configuring relationships between models, including API endpoints for fetching nested data.
1. [Querying](/guide/models/querying.md) - Information about querying data via the ORM.
1. [Customization](/guide/models/customization.md) - Information about customizing models with custom methods.
