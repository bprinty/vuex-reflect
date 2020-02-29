# Contract

Similarly to the [ORM](/guide/models/properties.md) syntax for defining an API contract, this library allows developers to explicitly provide a specification for model properties so that assumptions can be made about how data should be managed. This section will detail how to explicitly declare a contract for models you define in your store.

The following code shows the data structure for declaring Model properties:

```javascript
const myModels = {
  api: { ... },
  contract: {
    /**
    * Placeholder property for example.
    */
    myProp: {
      /**
      * Default value for property.
      */
      default: null,
      /**
      * Default type for the property. If no `mutate` configuration
      * is set, the type specified here will be used to mutate the object.
      */
      type: String,
      /**
      * Mutation function for processing property on update.
      * @param value - Value passed to property on update.
      * @returns Mutated value to set as model property.
      */
      mutate: function(value) {
        ...
        return newValue;
      },
      /**
      * Validation function for ensuring property is valid.
      * @param value - Un-mutated value passed to property on update.
      * @returns Boolean describing if value is valid or not.
      */
      validate: function(value) {
        ...
        return isValid;
      },
      /**
      * Parse the `id` property from nested models as the value that
      * is stored for this parameter. By setting the `link` property,
      * nested models will automatically be added to the store
      */
      link: 'linkedModels',
      /**
      * Shorthand for easily renaming a model property. In this case,
      * `originalName` in the payload for this model will be cast to
      * `myProp` when the model is used and casted back to `originalName`
      * when data are sent back to the application API.
      */
      from: 'originalName',
    },
    ...
  },

  ...

}
```

If you don't wish to specify detailed property-specific configuration, you can use the following shorthand for simply setting defaults:

```javascript
const myModels = {
  api: { ... },
  contract: {
      prop1: null,
      prop2: 2,
      prop3: 'foo',
  },
}
```

## Vuex Constructs

Considering the API definition above, several constructs are created for validating and mutating data for store updates. In particular, Vuex [mutations](https://vuex.vuejs.org/guide/mutations.html) are created for each type of API specification, and are stored with the names ``<model>.<mutation>``. For clarity, the above specification is equivalent to (only a few mutations will be described to provide context):

```javascript
const state = {
  myModels: [],
};

...

const mutations = {
  /**
   * Add existing instance(s) to the store
   */
  'myModels.add': (state, data) => {
    // 1. Validate data for each key using `validate` callback
    // 2. Mutate data for each key using `mutate` callback
    // 3. Add resulting data to store
  },
  /**
   * Action for creating a single model instance via API.
   */
  'myModels.update': (state, data) => {
    // 1. Validate data for each key using `validate` callback
    // 2. Mutate data for each key using `mutate` callback
    // 3. Search for existing records in the store
    // 4. Update existing records with new data
  },
  /**
   * Action for fetching a single model instance by ID.
   */
  'myModels.remove': (state, id) => {
    // 1. Search for existing record in the store
    // 2. Remove existing record from the store
  },

}
```

> Note that the mutations referenced above perform all data validation and reformatting according to the contract specification.


### Mutations

The following table shows a full list of available mutations created for model definitions:

| Mutation | Description |
|-|-|
| `<model>.add` | Add existing instance(s) to the store |
| `<model>.update` | Update existing instance(s) in the store |
| `<model>.remove` | Remove existing instance from the store |

And the code below shows some examples of how to use these mutations:

```javascript
// add new instance to the store
store.commit('myModels.add', { id: 5, foo: 'foo', bar: 'bar' });

// add several new instances to the store
store.commit('myModels.add', [
    { id: 7, foo: 'foo', bar: 'bar' },
    { id: 8, foo: 'foo', bar: 'bar' }
]);

// update the data for an existing instance
store.commit('myModels.update', { id: 5, foo: 'baz' });

// update the data for several existing instance
store.commit('myModels.update', [
    { id: 7, foo: 'baz' },
    { id: 8, bar: 'baz' },
]);

// remove an existing instance from the store
store.commit('myModels.remove', 5);
store.commit('myModels.remove', { id: 5, foo: 'foo', bar: 'bar' });
```

See the [API](/guide/store/api.md) section of the documentation for information on the other Vuex constructs defined by this module. This section of the documentation only describes the `state parameters`, and `mutations` created, but other Vuex `actions` are used to manage the API connection.

## Linked Models

As alluded to in the contract definition above, you can configure properties to reference other types of models via the `link` parameter in the contract definition. If the `link` property is specified, the library will try to parse nested payloads for the property and commit those linked model data into the store.

For example, if the API you're pulling data from produces nested data:

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

And you have two models defined for your store like so:

```javascript
const authors = {
  contract: { ... },
};

const posts = {
  contract: {
    title: '',
    body: '',
    author_id: {
      from 'author',
      mutate: data => data.id,
      link: 'authors',
    },
  },
};
```

Then this library will automatically commit `authors` information to the store once they're fetched via the API. For example:

```javascript
store.authors  // []
store.posts  // []
store.dispatch('posts.query').then((data) => {
  store.posts // [{id: 1, title: 'foo', body: 'bar', author_id: 1}, ...]
  store.authors // [{id: 1, name: 'foobar'}, ...]
});
```
