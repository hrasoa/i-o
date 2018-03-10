/**
 * https://w3c.github.io/IntersectionObserver/#dom-intersectionobserver-intersectionobserver
 *
 * @typedef {Object} IntersectionObserver
 * @property {Element} [root=null]
 * @property {string} [rootMargin='0px']
 * @property {Array.<number>} [threshold=[0]]
 * @property {Function} observe
 * @property {Function} unobserve
 * @property {Function} disconnect
 * @property {Function} takeRecords
 */

/**
 * https://www.w3.org/TR/intersection-observer/#dictdef-intersectionobserverinit
 *
 * @typedef {Object} IntersectionObserverInit
 * @property {Element} [root=null]
 * @property {string} [rootMargin='0px']
 * @property {Array.<number>} [threshold=[0]]
 */

/**
 * https://www.w3.org/TR/intersection-observer/#dictdef-intersectionobserverentryinit
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
 * @typedef {Object} DefaultOptions
 * @property {Function} [onIntersection=null]
 * @property {number} [delay=800]
 * @property {number} [cancelDelay=250]
 */

/**
 * @constant {DefaultOptions}
 * @default
 */
const DEFAULT_OPTIONS = {
  onIntersection: null,
  delay: 800,
  cancelDelay: 250,
};

/**
 * Data attribute name that we use to identify our entries
 *
 * @constant {string}
 */
const ATTR_ID = 'data-io-id';

/**
 * @class
 */
class Io {
  /**
   * @param {Object} [options={}]
   * @param {IntersectionObserverInit} [options.observer=undefined]
   * @param {Function} [options.onIntersection=null]
   * @param {number} [options.delay=800]
   * @param {number} [options.cancelDelay=250]
   */
  constructor(options = {}) {
    const { observer, ...rest } = options;
    /**
     * @type {DefaultOptions}
     * @member Io
     */
    this.options = { ...DEFAULT_OPTIONS, ...rest };
    /**
     * @type {{lastIn:number,lastOut:number,timerId:number,options:DefaultOptions}}
     * @member Io
     */
    this.entries = {};
    /**
     * @type {IntersectionObserver}
     * @member Io
     */
    this.api = typeof window !== 'undefined' && window.IntersectionObserver ?
      new window.IntersectionObserver(this.handleIntersection.bind(this), observer) : null;
  }

  /**
   * @private
   * @param {Array.<IntersectionObserverEntry>} entries
   */
  handleIntersection(entries) {
    for (let i = entries.length - 1; i >= 0; i -= 1) this.handleEntryIntersection(entries[i]);
  }

  /**
   * @private
   * @param {IntersectionObserverEntry} entry
   */
  handleEntryIntersection(entry) {
    const id = entry.target.getAttribute(ATTR_ID);
    const { onIntersection, delay, cancelDelay } = this.entries[id].options;

    if (!onIntersection) return;

    const { target, isIntersecting, time } = entry;

    this.entries[id][isIntersecting ? 'lastIn' : 'lastOut'] = time;
    const { lastIn = 0, lastOut = 0 } = this.entries[id];

    if (isIntersecting) {
      const step = (timestamp) => {
        if (timestamp - lastIn < delay) this.entries[id].timerId = requestAnimationFrame(step);
        else onIntersection(entry, () => { this.unobserve(target); });
      };
      this.entries[id].timerId = requestAnimationFrame(step);
    }

    if (!isIntersecting) {
      onIntersection(entry, () => { this.unobserve(target); });
      if (lastIn - lastOut < cancelDelay) cancelAnimationFrame(this.entries[id].timerId);
    }
  }

  /**
   * @param {Element} target
   */
  unobserve(target) {
    if (!this.api) return;
    const id = target.getAttribute(ATTR_ID);
    this.entries[id] = null;
    this.api.unobserve(target);
  }

  disconnect() {
    if (!this.api) return;
    this.api.disconnect();
  }

  takeRecords() {
    return this.api ? this.api.takeRecords() : null;
  }

  /**
   * Watch for an element.
   *
   * @param {Element} target
   * @param {DefaultOptions} [options=undefined]
   */
  observe(target, options) {
    if (!this.api) return;
    const id = getEntryId();
    this.entries[id] = { options: { ...this.options, ...options } };
    target.setAttribute(ATTR_ID, id);
    this.api.observe(target);
  }
}

/**
 * Get the data attribute value of one entry
 *
 * @private
 * @returns {string}
 */
function getEntryId() {
  return `io-${getUniq()}`;
}

/**
 * @private
 * @returns {string}
 */
function getUniq() {
  return Math.random().toString(36).substr(2, 9);
}

export default Io;

export { getEntryId, getUniq };
