# Contract






```javascript
const myModels = {
  default: [],
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


```javascript
const myModels = {
  default: [],
  api: { ... },
  contract: {
      prop1: null,
      prop2: 2,
      prop3: 'foo',
  },
}
```

## Vuex Constructs

When defining the
