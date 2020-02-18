# Overview

Talk about how this section describes how models are reflected onto the store, along with other store abstractions for a more declarative


<!-- TODO: ADD DIAGRAM FOR DATA FLOW? -->
<mermaid>
graph TD
  A[Silvester] -->|Get money| B(Go shopping)
  B --> C{Let me think}
  C -->|One| D[Laptop]
  C -->|Two| E[iPhone]
  C -->|Three| F[Car]
  C -->|Four| F[Mac]
</mermaid>


Talk about clearing data from the store in components (lifecycle)


```html
<template></template>
<script>
export default {
  name: 'my-component',
  data() {
    return {
      items: [],
    }
  }
  created() {
    Item.fetch().then((items) => {
      this.items = items;
    });
  },
  destroyed() {
    // to clear items associated with this view
    this.items.forEach(obj => obj.remove());

    // or, to clear all items from the store
    Item.clear();
  },
}
</script>
```
