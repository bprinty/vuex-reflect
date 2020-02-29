# Overview

In a previous section of the documentation, we discussed the ORM and how to define front-end models for your application that can represent data from an external API. This section of the documentation will cover how data are organized in the Vuex store when you define models, along with the Vuex constructs used for accessing and mutating data within this library.

::: tip Disclaimer

This section is only relevant if you wish to understand how the ORM functions in the application or develop configuration for the store directly (bypass using the ORM). If you plan to use the ORM with this plugin, simply follow the guidelines in the [Models](/guide/models/overview.md) section of the documentation.

:::


Similarly to the previous section, let's take a top-down approach to understanding how data are managed in the Vuex store. This section will reference two models from the previous section: `Posts` and `Authors`. Just as a refresher, here are endpoints for the `Author` model:

```
/authors
  GET - Query all or a subset of authors.

/authors/:id
  GET - Get the metadata for a single author.
  PUT - Update data for a single author.
```

The `Author` records from this API take the shape:

```javascript
// GET /authors
[
  { id: 1, name: 'Jane Doe', email: 'jane@doe.com' },
  { id: 2, name: 'John Doe', email: 'john@doe.com' },
  ...,
]
```

And here are endpoints for the `Post` model:

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

In the previous section, we detailed the `Model` API, and alluded to the fact that model data are tracked by the Vuex store using Vuex constructs. Normally, building out these constructs in Vuex can be quite cumbersome:

```javascript
const state = {
  authors: {},
};

const mutations = {
  updateAuthorList(state, authors) {
    authors.forEach((author) => {
      state.authors[author.id] = author;
    });
  },
  updateAuthorById(state, id, data) {
    state.authors[id] = data;
  }
  createAuthor(state, data) { ... },
  deleteAuthorById(state, id, data) { ... },
  ...
}

const getters = {
  getAuthorList(state) {
    return Object.keys(state.authors).map(key => state.authors[key]);
  },
  getAuthorById(state, id) {
    return state.authors[id];
  }
}

const actions = {
  fetchAuthors({ commit }) {
    return axios.get('/authors').then((response) => {
      commit('updateAuthorList', response.data);
    });
  },
  getAuthor({ commit }, id) {
    return axios.get(`/authors/${id}`).then((response) => {
      commit('updateAuthorById', id, response.data);
    });
  }
  createAuthor({ commit }, data ) { ... },
  updateAuthor({ commit }, data ) { ... },
  deleteAuthor({ commit }, data ) { ... },
  ...
}
```

The code above **only** details getting/fetching of `Author` data, and can get quite unruly for a complex application. We didn't even define mechanisms for updating `Author` data, which might have update validation rules and other checks for model properties.


## Defining Models

With this library, you can use a *simple* declarative syntax for defining these Vuex constructs:

```javascript
import v from 'validator';

/**
* Author model for application.
*/
const authors = {
  api: {
    fetch: '/authors',
    get: '/authors/:id',
    update: '/authors/:id',
  },
  contract: {
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
  },
};
```

This declarative syntax allows developers to **only worry about API contracts** and not how data are managed. Well-designed APIs are generally constructed in a consistent way, and this library leans on assumptions of that consistency to remove a ton of the boilerplate necessary for maintaining store objects.

Instead of needing to define individual actions for updating data via `GET/POST/PUT/DELETE` requests, this module automatically creates those constructs so you can simply use them if the state property you're declaring has an associated `api` block:

```javascript
// fetch all post data from api
this.$store.dispatch('profile.fetch').then((data) => {
  // do something with the data
});

// create new post
var post = { title: 'foo', body: 'this is a post', author_id: 1 };
this.$store.dispatch('posts.create', post);

// get specific post
const post = this.$store.getters('posts.get', 1);

// update post data
post.title = 'bar';
const post = this.$store.getters('posts.update', post);

// delete post
this.$store.getters('posts.delete', post);
```

The automatic creation of Vuex constructs performed by this library saves a lot of developer time and the engineering work associated with figuring out how to properly manage and reflect API data from an external application. Instead of needing to worry about defining the right set of methods for each type of API model they're working with, developers can get up and running by simply specifying the API data access patterns and contract.

Let's look at how we might add in our `Post` model to this contract:

```javascript
/**
 * Post model for application.
 */
const posts = {
  api: {
    create: '/posts',
    fetch: '/posts',
    update: '/posts/:id',
  },
  contract: {
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
    author_id: {
      link: 'authors',
    },
  },
};
```

One new thing to note about this contract is the `link` keyword to the `author_id` property. This keyword is used to automatically use nested payloads to update a linked model tracked by the store. More information on how to use the `link` keyword is in the [Contract](/guide/store/contract.md) section of the documentation.

> See the [Configuration](/guide/setup/configure.md) section of the documentation for details on how to register these definitions with the `Vuex` store.


## Using Model/Collection Syntax

In the `api` definitions for a model, you can also use a Model/Collection style syntax. For example, this definition:

```javascript
const item = {
  api: {
    model: '/authors/:id',
    collection: '/authors',
  }
  ...
}
```

Automatically translates to:

```javascript
const item = {
  api: {
    fetch: '/authors',
    create: '/authors',
    get: '/authors/:id',
    update: '/authors/:id',
    delete: '/authors/:id',
  }
  ...
};
```

Using the `model` and `collection` definitions can help developers reduce boilerplate. For clarity on describing internal functionality, the rest of this documentation will not use this shorthand during explanations.


## Using Models in Components

Once these models have been defined and [registered](/guide/setup/configure.md), you can use them throughout your application. As a quick example, let's take a look at a component that interacts with data from the `Post` model. In this component, you'll see that we need to first fetch the data before using it in the component.

```javascript
// JavaScript portion of Post Feed component.
export default {
  name: 'post-feed',
  created() {
    this.$store.dispatch('posts.fetch')
  },
  computed() {
    allPosts() {
      return this.$store.state.posts;
    },
    shortPosts() {
      return this.$store.state.posts.filter((x) => x.body.length < 200));
    },
  },
}
```


## Querying Data

You can also use other getters/mutations/actions automatically created for the models tracked by this library. For example, here is how you can query data for a single model instance:

```javascript
const post = store.getters('posts', 1); // get post by id

post.title // get author
post.author_id // get author id

const author = store.getters('author', {email: 'john@doe.com'});

author.name // get author name
```

Creating a new object is as easy as:

```javascript
store.dispatch('posts.create', {
  title: 'my-post',
  body: 'This is a post.',
  author_id: 1
});
```

This will automatically `POST` data to the application API and commit the resulting object as a new record in the `posts` state property of the store.

For more information on the `Vuex` constructs automatically created by this library, see the [Querying](/guide/store/querying.md) section of the documentation.


## Declarative Store Syntax

You can also use this declarative mechanism for other Vuex state properties as well (even if you're not connecting to an external API):

```javascript
/**
* Simple counter state property for counting something.
*/
const counter = {
  default: 0,
  mutations: {
    increment: value => value + 1,
  },
}
```

Using this way of defining state properties, mutations for updating the data are automatically created for the store, along with any additional mutations provided for the property:

```javascript
// using it in the store
store.state.counter; // get the state for counter
store.commit('counter', 2); // set the counter value to `2`
store.commit('increment'); // increment the counter
```

This may seem like a trivial syntactic pivot for non-API operations, but it becomes more useful when you're dealing with many state properties with lots of complexity. It also helps for maintainability to see all mutations/actions associated with a specific state property in the same block of code. Take the following code for example:


```javascript
/**
 * Simple counter state property for counting something.
 */
const counter = {
  default: 0,
  type: Number,
  mutations: {
    increment: value => value + 1,
    incrementBy: (value, extra) => value + extra,
    decrement: value => value - 1,
  },
  actions: {
    incrementAsync({ commit }) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          commit('increment');
        }, 1000);
      });
    }),
    incrementAndAdd({ commit }, value) {
      commit('increment');
      commit('incrementBy', value);
    },
  }
}

/**
 * Other dummy property for example.
 */
const otherProperty = {
  default: 'foo',
  type: String,
  mutations: {
    addBar: value => `${value}bar`,
  },
  actions: {
    postBar({ commit }) {
      return axios.post('/api/bar');
    }
  }
}

...
```

This might be preferable (easier to understand/maintain) compared to how Vuex constructs are normally declared:

```javascript
const store = {
  counter: 0,
  otherProperty: 'foo',
};

const mutations = {
  counter(state, value) {
    state.counter = Number(value);
  },
  increment(state) {
    state.count++;
  },
  incrementBy(state, extra) {
    state.count + extra;
  },
  decrement(state){
    state.count--;
  },
  otherProperty(state, value) {
    state.otherProperty = String(value);
  },
  addBar(state) {
    state.value = `${value}bar`;
  },
};

const actions = {
  incrementAsync({ commit }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        commit('increment');
      }, 1000);
    });
  }),
  incrementAndAdd({ commit }, value) {
    commit('increment');
    commit('incrementBy', value);
  },
  postBar({ commit }) {
    return axios.post('/api/bar');
  }
};
```

Obviously, syntactic preference is a subjective thing and changes based on differences in background and individual coding style. The main reason for introducing this more declarative syntax is because it is used for defining models for API endpoints.


## Clearing Store Data

We showed in the [Models](/guide/models/overview.md) section of the documentation how to use models to clear data from the store when a component is destroyed. Here is some code showing how you might do the same thing without using the ORM from this library:

```html
<template></template>
<script>
export default {
  name: 'my-component',
  data() {
    return {
      items: [],
    }
  }
  created() {
    this.$store.dispatch('items.fetch').then((items) => {
      this.items = items;
    });
  },
  destroyed() {
    // to clear items associated with this view
    this.items.forEach((obj) => {
      this.$store.commit('items.remove', obj);
    });

    // or, to clear all items from the store
    this.$store.commit('items.clear');
  },
}
</script>
```


## Additional Information

This overview covered several of the high-level features provided by this library, and you can find more information about each of the concepts alluded to above in these subsections:

1. [API](/guide/store/api.md) - Information about configuring API endpoints for fetching, updating, and querying data.
2. [Contract](/guide/store/contract.md) - Information about declaring API contracts for data using the declarative syntax.
3. [Querying](/guide/store/querying.md) - Information about how to use automatically generated Vuex constructs to query the data from the store.
4. [Debugging](/guide/store/debugging.md) - Information about how to use Vuex developer tools for debugging.
