

/**
 * Clojure for fluid query API.
 */
export default function query(data) {
  // use fluid api for query syntax (see d3 for details)
  this.data = data;
  return {
    filter: (params) => query(filter(params, this.data)),
    first: () => this.data[0],
    last: () => this.data[this.data.length - 1],
    all: () => this.data,
  };
}


function filter(params, data) {
  return data;
}
