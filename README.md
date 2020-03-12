
[![Build Status](https://travis-ci.com/bprinty/vuex-reflect.png?branch=master)](https://travis-ci.com/bprinty/vuex-reflect)


<!-- |Build status| |Code coverage| |Maintenance yes| |GitHub license| |Documentation Status|

.. |Build status| image:: https://travis-ci.com/bprinty/Flask-Occam.png?branch=master
   :target: https://travis-ci.com/bprinty/Flask-Occam

.. |Code coverage| image:: https://codecov.io/gh/bprinty/Flask-Occam/branch/master/graph/badge.svg
   :target: https://codecov.io/gh/bprinty/Flask-Occam

.. |Maintenance yes| image:: https://img.shields.io/badge/Maintained%3F-yes-green.svg
   :target: https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity

.. |GitHub license| image:: https://img.shields.io/github/license/Naereen/StrapDown.js.svg
   :target: https://github.com/bprinty/Flask-Occam/blob/master/LICENSE

.. |Documentation Status| image:: https://readthedocs.org/projects/flask-occam/badge/?version=latest
   :target: http://flask-occam.readthedocs.io/?badge=latest -->


# Vuex Reflect

## Overview

Vuex Reflect is a [Vuex](https://vuex.vuejs.org/) plugin that simplifies the configuration and management of data models in an application, providing a simple and declarative API for reflecting an external datasource. Modern web applications can be quite complex, and engineering a data store to reflect data models in your application doesn't need to be left up to interpretation. Abstractions like [SQLAlchemy](https://sqlalchemy.org) have reduced complexity and augmented developer experience for languages like Python, and this library similarly augments the developer experience associated with managing frontend application data.

It does this with two main features:

1. A declarative syntax for defining and configuring data models. This feature provides a) an easy way to connect models to an external API endpoint for CRUD actions, b) utilities for property mutations and validation, and c) a fluid query API for accessing data from the store.
2. Automatic vuex-based data management for models tracked by this library. Vuex Relfect handles all of the details around managing how data are stored, [updated](https://redux.js.org/recipes/structuring-reducers/updating-normalized-data/), and [normalized](https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape/) so that they can be easily be accessed via class-based model definitions (or from the store directly, if you're not a fan of ES6 classes).

### Notes on Vuex

Vuex is a fantastic library for doing exactly what it needs to do: manage state. The scope of Vuex was never to inherently manage data retrieval and updates via an API or other external data sources -- it simply (and elegantly) stores data and provides utilities for updating those data and propagating those updates to the components of your application. This package is a logical abstraction of that pattern, providing a more developer-friendly experience around interacting with data models and other external application data.

Because this module integrates with Vuex for storing data, it also integrates with Vue's official devtools extension to provide advanced features such as zero-config time-travel debugging and state snapshot export/import. It was made with REST API reflection specifically in mind, but can be extended to reflect other types of data sources (i.e. GraphQL).

### Why `Reflect`?

The name `Reflect` was chosen because this package essentially lets you reflect the data provided via an API into your store, with minimal configuration. There are many types of data reflection throughout a well-designed application - the UI reflects data from the frontend data store, the frontend store reflects data from the API, and the API reflects data from the database. This library covers one piece of that puzzle.


## Installation

### Install in Project

To use this library in a Vue project, add the package to your package dependencies via:

```bash
npm install --save vuex-reflect
```

Or, with [yarn](https://yarnpkg.com/):

```bash
yarn add vuex-reflect
```


### Use via CDN

To use this package via CDN, import it in your project via:

```html
<script src="https://unpkg.com/vuex-reflect/dist/vuex-reflect.min.js"></script>
```


## Documentation

Documentation for the project can be found [here](http://bprinty.github.io/vuex-reflect).


## Overview

For full documentation on how to use the plugin, see the (docs)[https://bprinty.github.io/vuex-reflect]. The sections below will give a brief overview of some of the concepts.

### Defining Models

For this example, let's say we're initially interested in a single `Todo` model. The endpoints supplying data for this model are as follows:

```
/todos
  GET - Query all or a subset of objects.
  POST - Create a new todo.

/todos/:id
  GET - Get the metadata for a single todo.
  PUT - Update data for a single todo.
  DELETE - Delete data for a single todo.
```

And we can define this model using the following configuration:

```javascript
import { Model } from 'vuex-reflect';

class Todo extends Model {

  /**
   * API config for fetching and updating data.
   */
  static api() {
    return {
      create: '/todos', // url for creating new todo items (POST)
      fetch: '/todos', // url for fetching data with parameters (GET /todos?name.like=my-todo)
      get: '/todos/:id', // url for getting data for a single todo (GET)
      update: '/todos/:id', // url for updating a single todo (PUT)
      delete: '/todos/:id', // url for deleting a single todo (DELETE)
    };
  }

  /**
   * Property definitions for the model.
   */
  static props() {
    return {
      /**
       * Todo text
       */
      text: {
        default: null,
        required: true
        mutation: value => `todo: ${value}`,
        validation: /^[a-zA-Z\-]+$/, // validate input with regex
      },
      /**
       * Todo status
       */
      done: {
        default: false,
        type: Boolean,
        validation: value => typeof value === "boolean", // validate input with function
      },
    };
  }
}
```

### Registering Models with Vuex

Once models are defined, you can register them with Vuex like so:

```javascript
import Vue from 'vue';
import Vuex from 'vuex';
import Reflect from 'vuex-reflect';
import { Todo } from 'models';

Vue.use(Vuex);

const db = Reflect({
  Todo,
});

const store = new Vuex.Store({
  state: { ... },
  mutations: { ... },
  plugins: [db],
})
```

With the syntax provided by this library, you define (in clear code) 1) where the data come from, and 2) how that data are mutated and validated during updates. Once you have a model, you can use it to fetch data for the store using (typically called when a component is created):

```javascript
Todo.query().then(() => {
  console.log('Data fetched and saved to vuex store.');
});
```

To see all of the data fetched, you can access the store directly:

```javascript
// result of: store.state
{
  todos: {
    1: { id: 1, text: 'first todo', done: false },
    2: { id: 2, text: 'done todo', done: true },
    ...
  }
}
```

Or, you can use the model classes to access the data:

```javascript
// result of: Todo.query().all().map(x => x.json())
[
  { id: 1, text: 'first todo', done: false },
  { id: 2, text: 'done todo', done: true },
  ...
]
```

### Data Interaction

Other api methods available on models include static methods for querying models from the store:

```javascript
// get an existing todo by id
const todo = Todo.query(1);
const todo = Todo.query().filter({ text: /part of todo text/ }).first(); // or by other properties

// count all completed todos
const doneTodos = Todo.query().filter({ done: true }).count();

// query with a fluid api
Todo.query().filter({ done: true }).has('text').offset(50).limit(3).count()
```

Or, static methods for changing data and committing those changes to the API and store:

```javascript
// create a new todo
const todo = new Todo({ text: 'read docs' });

// update it and save it via the API (results will be available via store)
todo.text += ' tomorrow';
todo.$.text // 'read docs' -> see the store version of the data
todo.commit() // POST /todos/:id -> commit result to store
todo.$.text // 'read docs tomorrow' -> store is updated after commit

// later in the application, fetch all todos and commit them to the store
await Todo.fetch();

// get the first todo and change the status
const todo = Todo.query().first();
todo.done = true;

// PUT the changed data to the API and commit the result to the store
await todo.commit();
```

For full documentation on how to use the library (this README details a small portion of the functionality), see the (docs)[https://bprinty.github.io/vuex-reflect].


## Contributors

### Getting Started

To get started contributing to the project, simply clone the repo and setup the dependencies using `yarn` or `npm install`:

```bash
git clone git@github.com:bprinty/vuex-reflect.git
cd vuex-reflect/
yarn
```

Once you do that, you should be ready to write code, run tests, and edit the documentation.


### Building Documentation

To develop documentation for the project, make sure you have all of the developer dependencies installed from the `package.json` file in the repo. Once you have all of those dependencies, you can work on the documentation locally using:

```bash
yarn docs:dev
```

Or, using `vuepress` directly:

```bash
vuepress dev docs
```

### Running Tests

The [Jest](https://jestjs.io/) framework is used for testing this application. To run tests for the project, use:

```bash
yarn test
```

To have Jest automatically watch for changes to code for re-running tests in an interactive way, use:

```bash
yarn test:watch
```

To run or watch a specific test during development, use:

```bash
yarn test:watch -t model.update
```

Or, you can invoke `jest` directly:

```bash
jest
jest --watch
jest --watch -t model.update
```

### Submiting Feature Requests

If you would like to see or build a new feature for the project, submit an issue in the [GitHub Issue Tracker](https://github.com/bprinty/vuex-reflect/issues) for the project. When submitting a feature request, please fully explain the context, purpose, and potential implementation for the feature, and label the ticket with the `discussion` label. Once the feature is approved, it will be re-labelled as `feature` and added to the project Roadmap.


### Improving Documentation

Project documentation can always be improved. If you see typos, inconsistencies, or confusing wording in the documentation, please create an issue in the [GitHub Issue Tracker](https://github.com/bprinty/vuex-reflect/issues) with the label `documentation`. If you would like to fix the issue or improve the documentation, create a branch with the issue number (i.e. `GH-123`) and submit a PR against the `master` branch.


### Submitting PRs

For contributors to this project, please submit improvements according to the following guidelines:

1. Create a branch named after the ticket you're addressing. `GH-1` or `bp/GH-1` are examples of good branch naming.
2. Make your changes and write tests for your changes.
3. Run all tests locally before pushing code.
4. Address any test failures caught by [Travis CI](https://travis-ci.com/bprinty/vuex-reflect).
5. Make sure you've updated the documentation to reflect your changes (if applicable).
6. Submit a PR against the `master` branch for the project. Provide any additional context in the PR description or comments.


### Keeping up to Speed on the Project

All development efforts for the project are tracked by the project [Kanban](https://github.com/bprinty/vuex-reflect/projects/1) board. Contributors use that board to communicate the status of pending, in-progress, or resolved development efforts. If you have a question about the Roadmap or current in-progress issues for the project, see that board.
