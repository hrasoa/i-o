const DEFAULT_OPTIONS = {
  timeout: 1000,
  once: true,
  intersectTime: 500,
  observer: {},
  onIntersection: console.log,
};

const DATA_ATTRIBUTE_ID = 'data-io-id';

class Io {
  constructor(options) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.entries = {};
    this.api = typeof window !== 'undefined' && window.IntersectionObserver ?
      new IntersectionObserver(this.handleIntersection.bind(this), this.options.observer) :
      null;
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      const { target, isIntersecting, time } = entry;
      const id = target.getAttribute(DATA_ATTRIBUTE_ID);
      const options = { ...this.options, ...this.entries[id].options };
      this.entries[id][isIntersecting ? 'lastIn' : 'lastOut'] = time;
      const { lastIn = 0, lastOut = 0 } = this.entries[id];

      if (isIntersecting) {
        this.entries[id].timerId = setTimeout(
          this.onIntersection.bind(this, id, entry, options),
          options.timeout,
        );
      }

      if (!isIntersecting && lastIn - lastOut < options.intersectTime) {        
        clearTimeout(this.entries[id].timerId);
      }
    });
  }

  onIntersection(id, entry, options) {
    options.onIntersection(entry);
    if (options.once === true) {
      this.unobserve(entry.target, id);
    }
  }

  unobserve(target, id) {
    if (!this.api) return;
    delete this.entries[id];
    this.api.unobserve(target);
  }

  disconnect() {
    if (!this.api) return;
    this.api.disconnect();
  }

  observe(target, options = {}) {
    if (!this.api) return;
    const id = getEntryId();
    this.entries[id] = { options };
    target.setAttribute(DATA_ATTRIBUTE_ID, id);
    this.api.observe(target);
  }
}

function getEntryId() {
  return `io-${getUniq()}`;
}

function getUniq() {
  return Math.random().toString(36).substr(2, 9);
}

module.exports = Io;
