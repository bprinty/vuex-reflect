
// import
import Vue from 'vue';
import Vuex from 'vuex';
import v from 'validator';
import { Model, Reflect } from '../../src/index';


/**
 * Profile store model.
 *
 * @param {string} username - Profile username.
 */
const profile = {
  singleton: true,
  default: {},
  api: {
    fetch: '/profile',
    update: '/profile',
  },
  contract: {
    /**
     * Profile username
     */
     username: {
       default: '<anonymous>',
       type: String,
     }
  }
}


/**
 * Author store model.
 *
 * @param {string} name - Author name.
 * @param {string} email - Author email.
 */
const authors = {
  api: {
    fetch: '/authors',
    get: '/authors/:id',
    update: '/authors/:id',
  },
  contract: {
    /**
     * Author name.
     */
    name: {
      default: null,
      required: true,
      type: String,
    },
    /**
     * Author email.
     */
    email: {
      default: null,
      type: String,
      validation: {
        check: v.isEmail,
        message: '`${value}` is not a valid email.',
      },
    },
  },
};


/**
 * Post model.
 *
 * @param {string} title - Post title.
 * @param {string} body - Post body text.
 * @param {string} author_id - ID for linked post author.
 */
const posts = {
  api: {
    collection: '/posts',
    model: '/posts/:id',
  },
  contract: {
    /**
     * Post title.
     */
    title: {
      default: 'My Post Title',
      required: true,
      type: String,
    },
    /**
     * Post body
     */
    body: {
      type: String,
      mutation: value => `<div>${value}</div>`,
    },
    /**
     * Linked post author.
     */
    author_id: {
      link: 'authors',
    },
  },
};


// store
Vue.use(Vuex);
export default new Vuex.Store({
  plugins: [
    Reflect({
      profile,
      authors,
      posts,
    })
  ],
});
