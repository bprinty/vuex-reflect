# API

The most important feature of this library is the ability to reflect data from an external API. When defining front-end models to store data, developers must specify configuration for how to retrieve the data.

The following code shows the data structure for Model API configuration:

```javascript
class MyModel extends Model {

  /**
   * Static method for declaring data accessors.
   */
  static api() {
    return {
      /**
       * Endpoint for querying a group of models via API parameters.
       * This method is used whenever Model.fetch() is called.
       */
      query: '/my-model',
      /**
       * Endpoint for creating a single model via API.
       * This method is used whenever Model.commit() is used after
       * a new frontend model is created.
       */
      create: 'my-model',
      /**
       * Endpoint for fetching a single model via API.
       * This method is used whenever Model.fetch(<id>) is called.
       */
      get: '/my-model/:id',
      /**
       * Endpoint for updating a single model via API.
       * This method is used whenever Model.commit() is called
       * for an existing model in the store. If `delete` is not
       * set, this endpoint will be used for DELETE operations.
       */
      update: '/my-model/:id',
      /**
       * Endpoint for deleting a single odel via API.
       * This method is used whenever Model.delete() is called for
       * an existing model in the store.
       */
      delete: '/my-model/:id',
    };
  }

  ...

}
```

> Note that `api()` must be a `static` method on your class. If it is not declared as a static method, the model **will not work according to expectations**.

## Interpreting URLs

Developers commonly need to construct URLs using model properties when updating data for a specific model. For instance, the following endpoints might be used for different actions associated with the `Post` model:

```javascript
PUT /posts/1  // update a post with the id `1`
GET /posts/1  // fetch data for a post with the id `1`
GET /posts/my-post // fetch data for a post with the url slug `my-post`
```

With this library, you can automatically construct those urls for models using the `:prop` syntax in `api()` configuration:

```javascript
PUT /posts/:id // update post
GET /posts/:id // fetch data for single post
GET /posts/:slug // fetch data for post with url slug
```

If the `Post` model has the properties `id` and `slug`, these urls will be automatically resolved when used for updating data.

This syntax will also work with more complex endpoint patterns:

```javascript
GET /authors/:id/posts/:tag // fetch posts from a specific author with a specific tag
```

## Request Methods

The following request methods are used by default for each of the actions in `api()` configuration:

```
{
  query: "GET",
  create: "POST",
  get: "GET",
  update: "PUT",
  delete: "DELETE",
}
```

To override these requests methods globally or for a specific model, see the [Configuration](/guide/setup/configure.md) section of the documentation.

## Alternative Data Sources

In addition to accepting strings, each of the keys in the `api()` configuration can take callables for retrieving data. If using callables for these actions, the callables *must* return a `Promise` object:

```javascript
class MyModel extends Model {

  static api() {
    return {
      update: '/my-model/:id',
      query: (params) => {
        return new Promise((resolve, reject) => {
          // code for querying data with params
          var data = {'one': 1, 'two': 2};
          resolve(data);
        });
      },
    };
  }
}

// fetch data with params
MyModel.fetch({ foo: 1, bar: 2 }).then(() => {
  // do something after data returns
})
```

This mechanism for overwriting data access methods is particularly useful if you're not using a REST API in your application (e.g. [GraphQL](https://graphql.org/) or [gRPC](https://grpc.io/]).
