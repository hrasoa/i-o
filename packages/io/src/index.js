/**
 * Executed each time the intersection changes.
 * @typedef {Function} onIntersection
 * @callback
 * @param {IntersectionObserverEntry} entry
 */
/**
 * Time before executing the onIntersection callback when the target instersects (in ms).
 * @typedef {number} delay
 */
/**
 * When the target goes from interescting to not-intersecting within this delay,
 * cancel the timer triggered when the target was intersecting (in ms).
 * @typedef {number} cancelDelay
 */

/**
 * Default observers options.
 *
 * @typedef {Object} Options
 * @property {onIntersection} [onIntersection]
 * @property {delay} [delay]
 * @property {cancelDelay} [cancelDelay]
 */
/**
 * @constant {Options}
 * @private
 */
const DEFAULT_OPTIONS = {
  onIntersection: null,
  delay: 800,
  cancelDelay: 250,
};

/**
 * Data attribute name that we use to identify our observers.
 *
 * @constant {string}
 * @default
 * @private
 */
const ATTR_ID = 'data-io-id';

/**
 * @see {@link https://www.w3.org/TR/intersection-observer/#dictdef-intersectionobserverinit}
 *
 * @typedef {Object} IntersectionObserverInit
 * @property {Element} [root=null]
 * @property {string} [rootMargin=0px]
 * @property {Array.<number>} [threshold=[0]]
 */
/**
 * @param {Object} [options]
 * @param {IntersectionObserverInit} [options.observerInit]
 * @param {onIntersection} options.onIntersection
 * @param {delay} [options.delay=800]
 * @param {cancelDelay} [options.cancelDelay=250]
 * @class Io
 * @example
 * const io = new Io({
 *   onIntersection: (entry) => {
 *     // do something
 *   }
 * });
 */
class Io {
  constructor(options) {
    const { observerInit, ...rest } = options || {};
    /**
     * @private
     * @type {Options}
     * @this Io
     */
    this.options = { ...DEFAULT_OPTIONS, ...rest };

    /**
     * Each new observer is stored in this variable.
     *
     * @private
     * @typedef {Object} Observer
     * @property {number} lastIn Last time the observer was intersecting.
     * @property {number} lastOut Last time the observer was not intersecting anymore.
     * @property {number} timerId requestAnimationFrame id.
     * @property {Options} options
     */
    /**
     * @private
     * @type {Object<string, Observer>}
     * @this Io
     */
    this.observers = {};

    /**
     * @see {@link https://w3c.github.io/IntersectionObserver/#dom-intersectionobserver-intersectionobserver}
     *
     * @private
     * @typedef {Object} IntersectionObserver
     * @property {Element} [root=null]
     * @property {string} [rootMargin='0px']
     * @property {number|Array.<number>} [threshold=0]
     * @property {Function} observe
     * @property {Function} unobserve
     * @property {Function} disconnect
     * @property {Function} takeRecords
     */
    /**
     * @private
     * @type {IntersectionObserver}
     * @this Io
     */
    // Set as null if IntersectionObserver is not supported
    // We also test the window object for server side rendering compatibility
    this.api = typeof window !== 'undefined' && window.IntersectionObserver ?
      new IntersectionObserver(this.handleIntersection.bind(this), observerInit) : null;

    if (typeof window !== 'undefined' && !window.IntersectionObserver) {
      console.warn([
        '/!\\ Your current browser does not support IntersectionObserver.',
        'Please upgrade it or consider using a polyfill.',
        'You can use "io.polyfill.js" we provide that includes the library with a polyfill.',
      ].join(' '));
    }
  }

  /**
   * @see {@link https://www.w3.org/TR/intersection-observer/#dictdef-intersectionobserverentryinit}
   *
   * @typedef {Object} IntersectionObserverEntry
   * @property {number} time
   * @property {Object} rootBounds
   * @property {Object} boundingClientRect
   * @property {Object} intersectionRect
   * @property {boolean} isIntersecting
   * @property {number} intersectionRatio
   * @property {Element} target
   */
  /**
   * IntersectionObserver callback
   *
   * @param {Array<IntersectionObserverEntry>} entries
   * @private
   */
  handleIntersection(entries) {
    for (let i = entries.length - 1; i >= 0; i -= 1) this.handleEntryIntersection(entries[i]);
  }

  /**
   * @param {IntersectionObserverEntry} entry
   * @private
   */
  handleEntryIntersection(entry) {
    const id = entry.target.getAttribute(ATTR_ID);
    // Exit if the target does not have an id, or it is not in the observers object.
    if (!(id && this.observers[id])) return;

    const { onIntersection, delay, cancelDelay } = this.observers[id].options;
    const { isIntersecting } = entry;
    // Each time the intersection changes, store the current time.
    // This help us figure out when to call the onIntersection callback.
    this.observers[id][isIntersecting ? 'lastIn' : 'lastOut'] = entry.time;
    const { lastIn = 0, lastOut = 0 } = this.observers[id];

    if (isIntersecting) {
      // When the target is intersecting, we want to call the "onIntersection" callback
      // only after the "delay" provided in the options.
      // We assume that if the user scrolls quickly, we do not need to
      // execute that callback, saving extra operations on the scroll.
      const step = (timestamp) => {
        // Loop again until we reach the delay.
        if (timestamp - lastIn < delay) this.observers[id].timerId = requestAnimationFrame(step);
        // Now we can call onIntersection callback.
        else {
          cancelAnimationFrame(this.observers[id].timerId);
          onIntersection(entry);
        }
      };
      // Begin the loop.
      this.observers[id].timerId = requestAnimationFrame(step);
    }

    if (!isIntersecting) {
      // No need to delay the callback when does not intersect.
      onIntersection(entry);
      // Cancel the loop we triggered previously if the user scrolls too quickly.
      if (lastIn - lastOut < cancelDelay) {
        cancelAnimationFrame(this.observers[id].timerId);
      }
    }
  }

  /**
   * Watch an element.
   * @see {@link https://w3c.github.io/IntersectionObserver/#dom-intersectionobserver-observe}
   *
   * @member {Function}
   * @param {Element} target HTMLElement to watch
   * @param {Options} [options]
   * @public
   * @example
   * const image = document.querySelector('img');
   * io.observe(image);
   */
  observe(target, options) {
    if (!this.api) return;
    const opts = { ...this.options, ...options };
    if (!opts.onIntersection) {
      console.warn('Please provide the onIntersection callback.');
      return;
    }
    const id = getEntryId();
    this.observers[id] = { options: opts };
    target.setAttribute(ATTR_ID, id);
    this.api.observe(target);
  }

  /**
   * Unwatch an element from current instance.
   * @see {@link https://w3c.github.io/IntersectionObserver/#dom-intersectionobserver-unobserve}
   *
   * @member {Function}
   * @param {Element} target HTMLElement to unwatch
   * @public
   * @example
   * const image = document.querySelector('img');
   * io.unobserve(image);
   */
  unobserve(target) {
    if (!this.api) return;
    this.api.unobserve(target);
  }

  /**
   * Unwatch all elements from current instance.
   * @see {@link https://w3c.github.io/IntersectionObserver/#dom-intersectionobserver-disconnect}
   *
   * @member {Function}
   * @public
   */
  disconnect() {
    if (!this.api) return;
    const ids = Object.keys(this.observers);
    let id;
    // Clean-up pending timers.
    for (let i = ids.length - 1; i >= 0; i -= 1) {
      id = ids[i];
      if (this.observers[id] && this.observers[id].timerId) {
        cancelAnimationFrame(this.observers[id].timerId);
      }
    }
    this.api.disconnect();
  }

  /**
   * @see {@link https://w3c.github.io/IntersectionObserver/#dom-intersectionobserver-takerecords}
   *
   * @member {Function}
   * @returns {Array<IntersectionObserverEntry>}
   * @public
   */
  takeRecords() {
    return this.api ? this.api.takeRecords() : null;
  }
}

/**
 * Get the data attribute id value of the observer.
 *
 * @returns {string}
 * @private
 */
function getEntryId() {
  return `io-${getUniq()}`;
}

/**
 * @returns {string}
 * @private
 */
function getUniq() {
  return Math.random().toString(36).substr(2, 9);
}

export default Io;

export { getEntryId, getUniq };
