
// import
import { Model } from '../src/index';
import v from 'validator';


/**
 * Profile store model.
 *
 * @param {string} username - Profile username.
 */
const profile = {
  api: {
    query: '/profile',
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
    query: '/authors',
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
     create: '/posts',
     query: '/posts',
     update: '/posts/:id',
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

// exports
export default {
  profile,
  authors,
  posts,
};
