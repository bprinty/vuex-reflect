# Properties

Most (if not all) ORMs require some type of specification for Model properties so that assumptions can be made about how data should be available externally and processed internally. This section will detail how to explicitly declare properties for a model.

The following code shows the data structure for Model properties:

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
          default: 1,
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
        }
    };
  }

  ...

}

```

> Note that `props()` must be a `static` method on your class. If it is not declared as a static method, the model **will not work according to expectations**.


Under the hood, this module automatically creates state properties, mutations, and actions in Vuex. Setting a mutation as a property on a model is equivalent to setting a mutation


## Data Flow

Talk about the flow of setting a property

Talk about how data from the store can be accessed

```javascript
const obj = new MyModel({ myProp: null });

obj.myProp = 1; // 1. Validate input
                // 2. Mutate data
                // 3. Store data on instance

obj.commit();   // 1. Make axios request to update data, return promise
                // 2. Wait for response
                // 3. Update new value in store
```


https://vuex.vuejs.org/guide/mutations.html

You can find more information on this in the [Store](/guide/store/overview.md) section of the documentation.

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
obj.divWrappedProperty === '<div>foo</div>'; // true

// after instantiation
obj.divWrappedProperty = 'bar';
obj.divWrappedProperty === '<div>bar</div>'; // true
```


## Data Validation

Validation for model properties can be specified using the `validation` parameter within a property definition. The `validation` key can take either a callable returning a boolean:

```javascript
// within Model.props()
numericProperty: {
  default: 1,
  validate: (value) => {

  },
},
...
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
const obj = MyModel({ specificValue: 3 }) // valid value, no error
obj.specificValue = 2;

// invalid property values, errors thrown with message:
const obj = MyModel({ specificValue: 5 })
obj.specificValue = 6;
```

See [lodash](https://lodash.com/docs) and [validator](https://github.com/validatorjs/validator.js) for libraries that can provide validation for different types of data.

## Linked Models

As described in the [Overview](/guide/models/overview.md) section of the documentation, you

...
