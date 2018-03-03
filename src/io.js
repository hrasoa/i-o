import Observer from './observer';

const EVENT_NAME = 'io.visible';

class Io {
  constructor(props) {
    this.eventName = EVENT_NAME;
    this.entries = {};
    this.handleVisible = this.handleVisible.bind(this);
    this.api = new Observer(this.handleVisible);        
  }

  handleVisible(entries) {
    entries.forEach(entry => {
      const { target, isIntersecting, time } = entry;
      const id = target.getAttribute('data-entry-id');      
      this.entries[id][isIntersecting ? 'lastIn' : 'lastOut'] = time;
      if (isIntersecting) {
        this.entries[id].timerId = setTimeout(() => {
          const event = new CustomEvent(this.eventName, { detail: entry });
          target.dispatchEvent(event);
          this.unobserve(target, id);
        }, 1000);
      }
      const lastIn = this.entries[id].lastOut || 0;
      const lastOut = this.entries[id].lastIn || 0;
      if (!isIntersecting && lastIn - lastOut < 150) {
        clearTimeout(this.entries[id].timerId);
      }
    });
  }

  unobserve(target, id) {
    this.api.unobserve(target);
    target.removeEventListener(this.eventName, this.entries[id].cb);
  }

  observe(target, cb, options) {
    const id = `entry-${Object.keys(this.entries).length}`;
    target.setAttribute('data-entry-id', id);  
    this.entries[id] = { cb, options };
    target.addEventListener(this.eventName, this.entries[id].cb);
    this.api.observe(target);
  }
}

export default Io;

export { EVENT_NAME };
