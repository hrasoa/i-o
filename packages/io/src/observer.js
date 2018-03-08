export default class Observer {
  /**
   *
   * @param {Function} callback
   * @param {Object} [options=undefined]
   * @param {Element} [options.root=null] The root to use for intersection.
   * @param {string} [options.rootMargin=0px] Similar to the CSS margin property.
   * @param {Array.<number>} [options.threshold=0]
   * List of threshold(s) at which to trigger callback.
   */
  constructor(callback, options) {
    const observer = (typeof window !== 'undefined' && window.IntersectionObserver) ?
      new window.IntersectionObserver(callback, options) : null;
    return observer;
  }
}
