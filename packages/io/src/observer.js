export default class Observer {
  /**
   * @param {Function} callback
   * @param {Object} [options=undefined]
   * @param {Element} [options.root=null]
   * @param {string} [options.rootMargin=0px]
   * @param {Array.<number>} [options.threshold=0]
   */
  constructor(callback, options) {
    const observer = (typeof window !== 'undefined' && window.IntersectionObserver) ?
      new window.IntersectionObserver(callback, options) : null;
    return observer;
  }
}
