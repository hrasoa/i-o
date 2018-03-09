import Observer from './observer';

/**
 * https://www.w3.org/TR/intersection-observer/#dictdef-intersectionobserverinit
 * @typedef {Object} IntersectionObserverInit
 * @property {Element} [root=null]
 * @property {string} [rootMargin='0px']
 * @property {Array.<number>} [threshold=[0]]
 */

/**
 * https://www.w3.org/TR/intersection-observer/#dictdef-intersectionobserverentryinit
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
const DEFAULT_OPTIONS = {
  onIntersection: null,
  delay: 800,
  cancelDelay: 250,
};

/**
 * @constant {string}
 */
const ATTR_ID = 'data-io-id';

class Io {
  /**
   *
   * @param {Object} [options={}]
   * @param {IntersectionObserverInit} [options.observer={}]
   * @param {Function} [options.onIntersection=null]
   * @param {number} [options.delay=800]
   * @param {number} [options.cancelDelay=250]
   */
  constructor(options = {}) {
    const { observer, ...rest } = options;
    this.options = { ...DEFAULT_OPTIONS, ...rest };
    this.entries = {};
    this.api = new Observer(this.handleIntersection.bind(this), observer);
  }

  /**
   *
   * @private
   * @param {Array.<IntersectionObserverEntry>} entries
   */
  handleIntersection(entries) {
    for (let i = entries.length - 1; i >= 0; i -= 1) this.handleEntryIntersection(entries[i]);
  }

  /**
   *
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
    const unobserve = this.unobserve.bind(this, target, id);

    if (isIntersecting) {
      const step = (timestamp) => {
        if (timestamp - lastIn < delay) this.entries[id].timerId = requestAnimationFrame(step);
        else onIntersection(entry, unobserve);
      };
      this.entries[id].timerId = requestAnimationFrame(step);
    }

    if (!isIntersecting) {
      onIntersection(entry, unobserve);
      if (lastIn - lastOut < cancelDelay) cancelAnimationFrame(this.entries[id].timerId);
    }
  }

  /**
   *
   * @param {Element} target
   * @param {string} id
   */
  unobserve(target, id) {
    if (!this.api) return;
    this.entries[id] = null;
    this.api.unobserve(target);
  }

  disconnect() {
    if (!this.api) return;
    this.api.disconnect();
  }

  /**
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
 *
 * @returns {string}
 */
function getEntryId() {
  return `io-${getUniq()}`;
}

/**
 *
 * @returns {string}
 */
function getUniq() {
  return Math.random().toString(36).substr(2, 9);
}

export default Io;

export { getEntryId, getUniq };
