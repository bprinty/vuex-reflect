# Overview

Let's take a top-down approach to understanding how models work with Vuex Reflect. Throughout this section of the documentation, let's focus on building a content management application with two related models: `Posts` and `Authors`. Using the ORM from this library, we want to define Models to help us traverse our data and reflect a backend API. Additionally, we'll be defining relationships in our Models that connect the two models. First, let's start with `Author`. The API for reflecting author data looks like:

```
/authors
  GET - Query all or a subset of authors.

/authors/:id
  GET - Get the metadata for a single author.
  PUT - Update data for a single author.

/authors/:id/posts
  GET - Query all or a subset of posts for a single author.
```

Where `Author` records from the API have the shape:

```javascript
[
  { id: 1, name: 'Jane Doe', email: 'jane@doe.com' },
  { id: 2, name: 'John Doe', email: 'john@doe.com' },
  ...,
]
```

Note that a targeted endpoint exists `/authors/:id/posts` for querying all posts for a specific author. This can be represented in our Model definition via `relationship()` configuraton.

Now that we understand the data involved, let's define our author model like (using `validator` for email validation):

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
      udpate: '/authors/:id',
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
        validation: /^[a-zA-Z]+( [a-zA-z]+)?$/, // validate input with regex
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
        type: Post,
        fetch: '/authors/:id/posts',
      },
    }
  }
}
```

Let's unpack some of the items above:

1. There are many different api actions that can be used when defining Models. The [API](/guide/models/api.md) subsection has more details on all available actions.
2. Properties can define (in a declarative way) rules for mutating and validating data during updates. The [Properties](/guide/models/properties.md) subsection has more information on these rules.
3. Relationships between models where data can be fetched via API can be defined using the `relationships()` static method. The [Relationships](/guide/models/relationships.md) subsection has more information on how to configure these data links.

Now that we've defined our `Author` Model, let's define our `Post` Model. The API for reflecting post data looks like:

```
/posts
  GET - Query all or a subset of authors.

/posts/:id
  GET - Get the metadata for a single post.
  PUT - Update data for a single post.
  DELETE - Delete a specific post.
```

Where `Post` records from the API have the shape:

```javascript
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

Note that `Post` data from the API contains nested information about related `Author` data. This is a common pattern in web development, and ORMs should be built to handle that information accordingly. You can see in the `Post` model definition below, where the nested `Author` configuration is represented as an entry in the `props()` definition:

```javascript
class Post extends Model {

  /**
   * API config for fetching and updating data.
   */
  static api() {
    return {
      create: '/posts', // url for POST-ing new todo items
      query: '/posts', // url for querying with parameters (/todos?name.like=my-todo)
      update: '/posts/{id}', // url for GET/PUT/DELETE operations on single todo
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
      },
    };
  }
}
```

Once these models have been defined, you can interact with the data like so:

```javascript
// javascript detailing how to use the orm to fetch data in
export default {
  name: 'my-component',
  created() {
    Post.fetch() // fetch data and save to store
  },
}
```

Once data have been fetched and added to the frontend store, you can query and interact with those data:

```javascript
const post = Post.get(1); // get post by id

post.title // get author
post.author.email // get author email


typeof post.author === 'Author'

```

And since author data was embedded in the `Post` fetch, you can also access `Author` data from the store without fetching authors:

```

```

This highlights an important principle you need to understand when using this library: **any models you fetch will be saved to the store, and any model in the store is queryable via the orm**. The [Store](/guide/store/overview.md) section provides more detail about how data flow into and out of the store. Technically, you don't even need models to use the API reflection functionality provided by this module. All Models in this module use getters and mutations from the store when accessing data. That section of the documentation discusses internals of how data are stored and how you can use the store in a declarative way without defining models.

This overview covered several of the high-level features provided by this module, and you can find more information about each of the concepts alluded to above in these subsections:

1. [API]
2. [Properties]


 about configuring, getting, and setting properties on models is detailed in the [Properties](/guide/models/properties.md) subsection of this documentation.


TODO: GO OVER ALL COMPONENTS OF THE MODELS AND TALK ABOUT HOW THEY'LL BE ELABORATED ON IN OTHER SECTIONS OF THE DOCUMENTATION
