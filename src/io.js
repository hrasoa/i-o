const DEFAULT_OPTIONS = {
  timeout: 1000,
  once: true,
  intersectTime: 150,
  observer: {},
  onIntersect: console.log,
};

const DATA_ATTRIBUTE_ID = 'data-io-id';

class Io {
  constructor(options) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.entries = {};
    this.handleIntersection = this.handleIntersection.bind(this);
    this.api = new IntersectionObserver(this.handleIntersection, this.options.observer);
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
          this.handleOnIntersection.bind(this, id, entry, options),
          options.timeout,
        );
      }

      if (!isIntersecting && lastIn - lastOut < options.intersectTime) {
        clearTimeout(this.entries[id].timerId);
      }
    });
  }

  handleOnIntersection(id, entry, options) {
    options.onIntersect(entry);
    if (options.once === true) {
      this.unobserve(entry.target, id);
    }
  }

  unobserve(target) {
    this.api.unobserve(target);
  }

  observe(target, options = {}) {
    const id = getEntryId();
    this.entries[id] = { options };
    target.setAttribute(DATA_ATTRIBUTE_ID, id);
    this.api.observe(target);
  }
}

function getEntryId() {
  return `io-${getTimestamp()}`;
}

function getTimestamp() {
  return new Date().getTime();
}

export default Io;
