import Observer from './observer';

const DEFAULT_OPTIONS = {
  observer: {},
  onIntersectionOut: null,
  onIntersection: null,
  delay: 800,
  cancelDelay: 250,
};

const ATTR_ID = 'data-io-id';

class Io {
  constructor(options) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.entries = {};
    this.api = new Observer(this.handleIntersection.bind(this), this.options.observer);
  }

  handleIntersection(entries) {
    for (let i = entries.length - 1; i >= 0; i -= 1) this.handleEntryIntersection(entries[i]);
  }

  handleEntryIntersection(entry) {
    const { target, isIntersecting, time } = entry;
    const id = target.getAttribute(ATTR_ID);
    const {
      onIntersectionOut,
      onIntersection,
      delay,
      cancelDelay,
    } = { ...this.options, ...this.entries[id].options };
    this.entries[id][isIntersecting ? 'lastIn' : 'lastOut'] = time;
    const { lastIn = 0, lastOut = 0 } = this.entries[id];
    const unobserve = this.unobserve.bind(this, target, id);

    if (isIntersecting && onIntersection) {
      const step = (timestamp) => {
        if (timestamp - lastIn < delay) this.entries[id].timerId = requestAnimationFrame(step);
        else onIntersection(entry, unobserve);
      };
      this.entries[id].timerId = requestAnimationFrame(step);
    }

    if (!isIntersecting) {
      if (onIntersectionOut) onIntersectionOut(entry, unobserve);
      if (lastIn - lastOut < cancelDelay) cancelAnimationFrame(this.entries[id].timerId);
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
    target.setAttribute(ATTR_ID, id);
    this.api.observe(target);
  }
}

function getEntryId() {
  return `io-${getUniq()}`;
}

function getUniq() {
  return Math.random().toString(36).substr(2, 9);
}

export default Io;

export { getEntryId, getUniq };
