# Querying

### Querying Data

```javascript
const user = new User({username: 'test'})
user.commit() // save data to database and update store

// props
user.$.username // store version of username
user.username // local version of username
user.username = 'test' // set local username and do validation and mutations
user.commit() // reflect data to database and commit to store

// retrieval
User.fetch() // fetch data from remote server and commit to store
User.next().fetch() // fetch paginated data
User.fetch({limit: 50, offset: 0}) // fetch with limit and offset

// relationships
const user = await new User.fetch({username: 'test'}) // fetch with query parameters
const user = await new User.fetch(1) // fetch by id
user.comments.fetch() // fetch remote comments for user
user.comments // get local comment data from store

```

```javascript

Todo.query().filter({done: true})
Todo.query().filter({done: true}).count()

Todo.get(1)



var post = Post.query().with('author').first()
var post = Post.query().with('author').last()
var posts = Post.query().with('author').offset(1).limit(5);
var posts = Post.query().filter({'name': contains('test')}).all()
var posts = Post.query().filter((record) => {
  return record.id.isin([1, 2]);
}).all()
var posts = Post.query().order('name');


```
