# Properties

Most (if not all) ORMs require some type of specification for Model properties so that assumptions can be made about how data should be available externally and processed internally. This section will detail how to explicitly declare properties for a model.

The following code shows the data structure for declaring Model properties:

```javascript
class MyModel extends Model {

  ...

  /**
   * Static method for declaring properties of Model.
   */
  static props() {
    return {
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
           * Collapse nested models into a single property for API
           * update actions (POST or PUT). This value is only relevant if
           * the property is an Object type or a linked Model instance.
           */
           collapse: 'linkedPropId',
           /**
            * Function for retrieving property data. Properties that
            * instrument this property are not saved in the store for models,
            * and instead accessed using the function specified below. This
            * is primarily useful for adding linked models that aren't nested
            * in response data.
            * @returns Value accessible via Model.<prop>
            */
            get: () => {},
            /**
             * Shorthand for easily renaming a model property. In this case,
             * `originalName` in the payload for this model will be cast to
             * `myProp` when the model is used and casted back to `originalName`
             * when data are sent back to the application API.
             */
            from: 'originalName',
        },
    };
  }

  ...

}

```

> Note that `props()` must be a `static` method on your class. If it is not declared as a static method, the model **will not work according to expectations**.

Under the hood, this module automatically creates state properties, mutations, and actions in Vuex. Setting a mutation as a property on a model is equivalent to creating a mutation in the Vuex store for changing a state parameter. You can find more information on this in the [Store](/guide/store/overview.md) section of the documentation.

If you don't wish to specify detailed property-specific configuration, you can use the following shorthand for simply setting defaults:

```javascript
class MyModel extends Model {
  static props() {
    return {
      prop1: null,
      prop2: 2,
      prop3: 'foo',
    };
  }
}
```

## Data Flow

There are several logical processes that happen behind the scenes when a value is set on an Model instance. Take this block of code for example:

```javascript
const obj = new MyModel({ myProp: null });
obj.myProp = 1;
obj.commit();
console.log(obj.myProp) // 1
```

What's really happening during each of these operations is the following:

```javascript
const obj = new MyModel({ myProp: null });

obj.myProp = 1; // 1. Validate input using validate function
                // 2. Mutate data using mutate function
                // 3. Store data on instance (not in Vuex store until commit)

obj.commit();   // Dispatch Vuex store action that will:
                //   1. Make axios request to update data, return promise
                //   2. Wait for response
                //   3. Update new value in Vuex store

console.log(obj.myProp); // Use Vuex getter to pull property from store for instance.
```

More information about how data are organized in the Vuex store can be found in the [Store](/guide/store/overview.md) section of the documentation.

## Mutating Properties

You can also define mutations for properties in your Model definitions via the `mutation` parameter within a property definition. The `mutation` key takes a callable and should return a value to store as the property state:

```javascript
// within Model.props()
divWrappedProperty: {
  default: '&nbsp;',
  mutate: value => `<div>${value}</div>`,
},
```

After setting the `mutation` key on a property definition, any attempts to set the property will be automatically processed:

```javascript
// on instantiation
const obj = MyModel({ divWrappedProperty: 'foo' })
console.log(obj.divWrappedProperty); // '<div>foo</div>'

// after instantiation
obj.divWrappedProperty = 'bar';
console.log(obj.divWrappedProperty); // '<div>bar</div>'
```

## Data Validation

Validation for model properties can be specified using the `validation` parameter within a property definition. The `validation` key can take either a callable returning a boolean:

```javascript
// within Model.props()
numericProperty: {
  default: 1,
  validate: (value) => {
    ... // validation logic
    return true;
  },
},
```

Or, a dictionary specifying the callable (`check`) and a message (`message`) to raise if the validation fails:

```javascript
// within Model.props()
specificValue: {
  default: 1,
  validate: {
    check: value => value < 4,
    message: "${value} must be less than 4.",
  },
}
```

Inputs to the validate function will be the pre-mutated value.

After setting the `validation` key on a property definition, any attempts to set the property will be automatically processed:

```javascript
// valid property values, no errors thrown:
const obj = MyModel({ specificValue: 3 })
obj.specificValue = 2;

// invalid property values, errors thrown with message:
const obj = MyModel({ specificValue: 5 })
obj.specificValue = 6;
```

See [lodash](https://lodash.com/docs) and [validator](https://github.com/validatorjs/validator.js) for libraries that can provide validation for different types of data.

## Linked Models

As described in the [Overview](/guide/models/overview.md) section of the documentation, you can configure properties to reference other types of models via the `type` parameter in Model property declaration.

If the API you're pulling data from produces nested data:

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

And you have two models configured for the nested data (in this case, `Author` and `Post`), you can configure the `Post` model to reference the internal `Author` model for the nested data like so:

```javascript
class Author extends Model { ... }

class Post extends Model {
  static props() {
    return {
      title: '',
      body: '',
      author: {
        type: Author,
      },
    };
  }
}
```

The configuration above will enable this library to automatically store `Author` objects in the store once they're fetched via the `/posts` endpoint. Additionally, `Author` models will be directly available from the `Post` instances, so you can traverse the model data like so:

```javascript
const post = Post.get(1) // get post with id `1` from the store
post.author.id     // 1
post.author.title  // Post 1
```

By default, on update actions, all of the author information will be sent in the `PUT` or `POST` payload:

```javascript
const post = Post.get(1); // get post with id `1` from the store
post.title = 'new title';
post.commit(); // see below for payload
```
```javascript
// PUT /posts/:id
{
    id: 1,
    title: 'new title',
    body: 'This is the text for post 1',
    author: {
      id: 1,
      name: 'Jane Doe',
      email: 'jane@doe.com'
    },
},
```

However, this often isn't a contract required by the application API. More commonly, the application API will accept a payload in the form:

```javascript
// PUT /posts/:id
{
    id: 1,
    title: 'new title',
    body: 'This is the text for post 1',
    author_id: 1,
},
```

To automatically collapse the nested `Author` data into a single update parameter, use the `collapse` parameter when defining the property:

```javascript
class Post extends Model {
  static props() {
    return {
      title: '',
      body: '',
      author: {
        type: Author,
        collapse: 'author_id',
      },
    };
  }
}
```

Similarly, `collapse` can take a callable that will accept the property data as input and return an object that will be added to the payload.

Explicitly declaring how models are related can assume many different types of patterns, and this library was built to accommodate as many as possible. For instance, sometimes related models are declared in the API using a key reference:

```javascript
// GET /posts/:id
{
    id: 1,
    title: 'new title',
    body: 'This is the text for post 1',
    author_id: 1,
},
```

If your frontend models would more easily be usable by changing the `author_id` property into an `Author` relationship, you can use `from` to automatically map the data in that way:

```javascript
class Post extends Model {
  static props() {
    return {
      title: '',
      body: '',
      author: {
        type: Author,
        from: 'author_id',
      },
    };
  }
}
```

However, this requires that the `Author` data being referenced is already in the Vuex store. When you access the property:

```javascript
Post.fetch().then(() => {
  const post = Post.get(1);
  post.author.id
});
```

This library will use a store getter to try to retrieve an `Author` model using the `author_id` data from the `posts` payload. An `Author` model will only be returned if that `Author` entry already exists in the store. Otherwise, accessing the `author` property will return `null`.

Or, you can simply use the `from` keyword to rename payload data to your liking (doesn't need to be associated with a linked model).

<!-- TODO: Talk about get() for fetching more complex relationships -->
