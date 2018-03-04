import Observer from './observer';

const DEFAULT_OPTIONS = {
  observer: {},
  onIntersectionOut: null,
  onIntersectionIn: null,
  delay: 800,
  intersectionTime: 250,
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
      onIntersectionIn,
      delay,
      intersectionTime,
    } = { ...this.options, ...this.entries[id].options };
    this.entries[id][isIntersecting ? 'lastIn' : 'lastOut'] = time;
    const { lastIn = 0, lastOut = 0 } = this.entries[id];
    const unobserve = this.unobserve.bind(this, target);

    if (isIntersecting && onIntersectionIn) {
      this.entries[id].timerId = setTimeout(() => {
        onIntersectionIn(entry, unobserve);
      }, delay);
    }

    if (!isIntersecting) {
      if (onIntersectionOut) onIntersectionOut(entry, unobserve);
      if (lastIn - lastOut < intersectionTime) clearTimeout(this.entries[id].timerId);
    }
  }

  unobserve(target) {
    const id = target.getAttribute(ATTR_ID);
    if (!this.api.unobserve) return;
    delete this.entries[id];
    this.api.unobserve(target);
  }

  disconnect() {
    if (!this.api.disconnect) return;
    this.api.disconnect();
  }

  observe(target, options = {}) {
    if (!this.api.observe) return;
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
