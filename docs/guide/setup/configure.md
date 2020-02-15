# Configure


## Registering Plugin

To register this plugin with the `Vuex` store in your application, add it to the list of plugins passed into `Vuex.Store()`:

```javascript
import Vue from 'vue'
import Vuex from 'vuex'
import Reflect from 'vuex-reflect'

Vue.use(Vuex)

const store = new Vuex.Store({
  plugins: [Reflect()]
})

export default store
```

## Axios Configuration

This library uses [axios](https://github.com/axios/axios) for making requests. To set up the plugin with an axios instance having a pre-defined configuration, you can set the `getAxios` configuration option when instantiating the plugin:

```javascript
const http = new axios.create({
  baseURL: process.env.VUE_APP_API,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
});

// passing in http object
var reflect = Reflect({
  axios: () => http,
});
```

If the result of `getAxios` is an object, this library will automatically wrap that object in an `axios({})` call. For example, this also works:

```javascript
var reflect = Reflect({
  axios: () => {
    baseURL: process.env.VUE_APP_API,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
});
```

You can also configure models individually with axios configuration. For more examples, see the [API](/guide/models/api.md) section of the documentation.


## Other Options

Other options available when setting up this library are as follows:

| Option                  | Type       | Default           | Description                                                                                                |
|:------------------------|:-----------|:------------------|:-----------------------------------------------------------------------------------------------------------|
| `axios`                 | `Function` | `axios`           | Function returning axios instance or axios configuration to use.                                           |
| `methods`               | `Object`   | *See below*       | HTTP request methods.                                                                                      |
| `primary`               | `String`   | `"id"`            | The property that should be used as the primary key to the model, usually something like `"id"`.           |


### Default Request Methods

To change the default request methods used for various operations

```javascript
var reflect = Reflect({
  methods: {
    'query': 'GET',
    'create': 'POST',
    'get': 'GET',
    'update': 'PUT',
    'delete': 'DELETE',
  },
});
```

> TODO: add more documentation for the Other Options and Default Request Methods sections to add more context.
