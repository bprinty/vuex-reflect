# Declare Syntax

```javascript
const declare = {
  counter: {
    default: 0,
    mutations: {
      increment: value => value + 1,
      incrementBy: (value, extra) => value + extra,
      decrement: value => value - 1,
      // incrementAsync: value => new Promise((resolve, reject) => {
      //   setTimeout(() => {
      //     resolve(value + 1);
      //   }, 100);
      // }),
    },
    actions: {
      incrementParts: ({ commit, dispatch }) => {
        commit('increment');
        commit('incrementBy', 5);
        dispatch('increment.delay');
      },
    }
  }
}

// using it in the store
store.state.counter // state for counter
store.commit('increment') // increment the counter
store.commit('incrementBy', 5) // increment the counter
store.dispatch('increment.delay') // increment with delay
store.dispatch('incrementBy.delay.1000', 5) // increment with delay
```


```javascript
const declare = {
  profile: {
    default: {
      authenticated: false,
      status: 'available',
    },
    template: {

    },
    fetch: '/api/profile',
  },
  users: {
    fetch: '/api/users',
    default: [],
    template: {
      /**
      * Unique id for object.
      */
      id: {
        default: null,
        mutation: value => Number(value) || null,
        validation: integer.and(min(1)).or(equal(null)),
      },
      /**
      * User display name.
      */
      username: {
        default: null,
        mutation: String,
        validation: string.and(length(3, 200)),
      },
    },
  },
};
```


```javascript
// fetching data from api
this.$store.dispatch('profile.fetch');

// saving data
this.$store.dispatch('profile.put', { username: 'new-username' });
```

```javascript
var declare = {
  counter: {
    default: 0,
    mutations: {
      increment: value => value + 1,
      add: (value, extra) => value + extra,
    }
  },
}
```

```html
<template>
  <div class="count">{{ count }}</div>
  <button @click="increment">Increment</button>
  <input v-model="amount" />
  <button @click="addMore">Add More</button>
</template>

<script>
export default {
  name: 'Counter',
  data() {
    return {
      amount: 0,
    }
  },
  computed: {...mapGetters('counter')},
  methods: {
    addMore() {
      this.$store.commit('add', 5);
    }
  }
}
</script>
```
