
// import
import { Model } from '../src/index';
import v from 'validator';


/**
 * Author model.
 *
 * @param {string} name - Author name.
 * @param {string} email - Author email.
 */
class Profile extends Model {

  api() {
    return {
      query: '/profile',
    };
  }

  props() {
    return {
      /**
      * Profile username
      */
      username: {
        default: '<anonymous>',
        type: String,
      }
    };
  }
}


/**
 * Author model.
 *
 * @param {string} name - Author name.
 * @param {string} email - Author email.
 */
class Author extends Model {

  // api
  api() {
    return {
      query: '/authors',
      get: '/authors/:id',
      update: '/authors/:id',
    };
  }

  // props
  props() {
    return {
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
    };
  }

  // relationships
  relationships() {
    return {
      /**
       * All todo items for a single author.
       */
      todos: {
        type: Array,
        model: Post,
        url: '/authors/:id/posts',
      },
    }
  }
}


/**
 * Post model.
 *
 * @param {string} title - Post title.
 * @param {string} body - Post body text.
 * @param {string} author_id - ID for linked post author.
 */
class Post extends Model {

  // api
  api() {
    return {
      collection: '/posts',
      model: '/posts/:id',
    };
  }

  // properties
  props() {
    return {
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
      author: {
        type: Author,
        collapse: 'author_id',
      },
    };
  }
}

// exports
export default {
  Author,
  Post,
};
