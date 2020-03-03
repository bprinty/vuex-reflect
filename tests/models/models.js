
// import
import Vue from 'vue';
import Vuex from 'vuex';
import v from 'validator';
import _ from 'lodash';
import { Model, Reflect } from '../../src/index';
import { profile, posts, authors } from '../store/models';


/**
 * Author model.
 *
 * @param {string} name - Author name.
 * @param {string} email - Author email.
 */
export class Profile extends Model {

  static api() {
    return profile.api;
  }

  static props() {
    return profile.contract;
  }
}


/**
 * Author model.
 *
 * @param {string} name - Author name.
 * @param {string} email - Author email.
 */
export class Author extends Model {

  // api
  static api() {
    return authors.api;
  }

  // props
  static props() {
    return authors.contract;
  }

  // relationships
  static relationships() {
    return {
      /**
       * All post items for a single author.
       */
       posts: {
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
export class Post extends Model {

  // api
  static api() {
    return posts.api;
  }

  // properties
  static props() {
    const data = _.clone(posts.contract);
    data.author.model = Author;
    return data;
  }
}

// exports
Vue.use(Vuex);
export default new Vuex.Store({
  plugins: [
    Reflect({
      profile: Profile,
      authors: Author,
      posts: Post,
    })
  ],
});
