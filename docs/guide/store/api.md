# API

The [Models](/guide/models/api.md) section of the documentation provided more detail about how API methods can be configured to pull information. It is highly recommended to read and understand the concepts outlined in that documentation before jumping further into this section of the docs.

## Alternative Data Sources

Without declaring `Model` classes, you can still use similar configuration for customizing API data access. Here is how you might configure this library to pull data from alternative data sources:

```javascript
const myModels = {
  default: [],
  api: {
    update: '/mymodel/:id',
    query: (params) => {
      return new Promise((resolve, reject) => {
        // code for querying data with params
        const data = [
          { 'one': 1, 'two': 2 },
          { 'three': 3, 'four': 4 },
        ];
        resolve(data);
      });
    },
  },
}
```

Using these alternative mechanisms for fetching data is as easy as using a Vuex action:

```javascript
store.dispatch('myModels.fetch', { foo: 1, bar: 2 }).then((results) => {
  // do something after data returns
})
```

This mechanism for overwriting data access methods is particularly useful if you're not using a REST API in your application (e.g. [GraphQL](https://graphql.org/) or [gRPC](https://grpc.io/]).


## Parsing Request Data

The syntax for customizing request parsing without defining Models is very similar to the syntax used when Models are defined:

```javascript
const myModels = {
  default: [],
  api: {
    update: (data) => {
      // parsing input for update action
      const {id, ...extra} = data;
      const newData = [id, extra];

      // return promise for sending the update
      return axios.put('/mymodel', newData).then((response) => {

        // parsing result to update internal properties
        const result = {response.data[0], ...response.data[1]};
        return result;
      });
    },
    query: (params) => {
      // return promise for fetching and processing the data
      return axios.get('/mymodel', { params }).then((response) => {

        // parse payload into new structure
        return response.data.map(item => Object.assign(item[1], { id: item[0] }));
      });
    },
  },
};
```
