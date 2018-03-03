const EVENT_NAME = 'io.intersect';

const DEFAULT_OPTIONS = {
  timeout: 1000,
  once: true,
  intersectTime: 150,
  observer: {},
};

const DATA_ATTR_ID = 'data-io-id';

class Io {
  constructor(options) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.eventName = EVENT_NAME;
    this.entries = {};
    this.handleIntersection = this.handleIntersection.bind(this);
    this.api = new IntersectionObserver(this.handleIntersection, this.options.observer);
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      const { target, isIntersecting, time } = entry;
      const id = target.getAttribute(DATA_ATTR_ID);
      const options = { ...this.options, ...this.entries[id].options };
      this.entries[id][isIntersecting ? 'lastIn' : 'lastOut'] = time;
      const { lastIn = 0, lastOut = 0 } = this.entries[id];

      if (isIntersecting) {
        this.entries[id].timerId = setTimeout(this.handleDispatchEvent.bind(this, {
          id,
          entry,
          options,
        }), options.timeout);
      }

      if (!isIntersecting && lastIn - lastOut < options.intersectTime) {
        clearTimeout(this.entries[id].timerId);
      }
    });
  }

  handleDispatchEvent({ id, entry, options }) {
    const event = new CustomEvent(this.eventName, { detail: entry });
    entry.target.dispatchEvent(event);

    if (options.once === true) {
      this.unobserve(entry.target, id);
    }
  }

  unobserve(target, id) {
    this.api.unobserve(target);
    target.removeEventListener(this.eventName, this.entries[id].cb);
  }

  getEntryId() {
    return `entry-${Object.keys(this.entries).length}`;
  }

  observe(target, cb, options = {}) {
    const id = this.getEntryId();
    this.entries[id] = { cb, options };
    target.setAttribute(DATA_ATTR_ID, id);
    target.addEventListener(this.eventName, this.entries[id].cb);
    this.api.observe(target);
  }
}

export default Io;

export { EVENT_NAME };
