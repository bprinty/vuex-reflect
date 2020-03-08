
// import
import { MockServer, collection, model } from './mock';

// database
class App extends MockServer {

  data() {
    return {
      profile: {
        username: 'admin',
      },
      posts: [
        {
          title: 'Foo',
          body: 'foo bar baz',
          hits: 100,
          author_id: 1,
          history: [
            { delta: 'foo' },
            { delta: 'bar' },
          ],
          archived: false,
        },
        {
          title: 'Bar',
          body: 'bar baz',
          hits: 200,
          author_id: 1,
          history: [],
          archived: true,
        },
      ],
      authors: [
        { name: 'Jane Doe', email: 'jane@doe.com' },
        { name: 'John Doe', email: 'john@doe.com' },
      ],
    };
  }

  relationships() {
    return {
      posts: {
        from: 'author_id',
        to: 'author',
        collection: 'authors',
      }
    }
  }

  api() {
    return {
      '/profile': {
        get: () => this.db.profile,
        put: (data) => {
          this.db.profile = Object.assign(this.db.profile, data);
          return this.db.profile;
        },
        delete: () => {
          this.db.profile = { username: 'admin' };
        },
      },
      '/posts': this.collection('posts'),
      '/posts/:id': this.model('posts'),
      '/posts/:id/history': {
        get: id => this.db.posts[id].history,
        post: (id, data) => {
          this.db.posts[id].history.push(data);
          return this.db.posts[id].history;
        },
      },
      '/posts/:id/archive': {
        post: (id) => {
          this.db.posts[id].archived = true;
          return this.db.posts[id];
        },
      },
      '/posts/:id/author': {
        get: id => this.db.authors[this.db.posts[id].author_id],
      },
      '/authors': this.collection('authors'),
      '/authors/:id': this.model('authors'),
      '/authors/:id/posts': {
        get: id => this.db.posts.filter(x => x.author_id === id),
      },
    }
  }
}

// exports
export default new App('blog');
