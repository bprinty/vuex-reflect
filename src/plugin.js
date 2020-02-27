
/**
 * Main entrypoint for Vuex Reflect plugin.
 */
export default function Reflect(models) {

  // sanitize inputs

  // configure options

  // set global axios instance?

  return (store) => {
    store.subscribe((mutation, state) => {
      // called after every mutation.
      // The mutation comes in the format of `{ type, payload }`.
    });
  }
}
