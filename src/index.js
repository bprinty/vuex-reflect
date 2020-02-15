/**
 * Main entry point for module
 */


/**
 * Example class.
 * @constructor
 * @param {number} number Input number.
 */
export default class Number {
  constructor(number) {
    this.number = number || 0;
  }
}


/**
 * Example add function.
 * @param {number} x First number to add.
 * @param {number} y Second number to add.
 * @return {number} Result of operation.
 */
export function add(x, y) {
  return x + y;
}
