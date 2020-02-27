
// import
import { MockServer, collection, model } from './mock';

// database
class App extends MockServer {

  data() {
    return {
      posts: [
        { title: 'Foo', body: 'foo bar baz', author_id: 1 },
        { title: 'Bar', body: 'bar baz', author_id: 1 },
      ],
      authors: [
        { name: 'Jane Doe', email: 'jane@doe.com' },
        { name: 'John Doe', email: 'john@doe.com' },
      ],
    };
  }

  api() {
    return {
      '/profile': {
        get: () => {
          return {
            name: 'Current User',
            email: 'current@user.com',
          };
        },
      },
      '/posts': this.collection('posts'),
      '/posts/:id': this.model('posts'),
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
