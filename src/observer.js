export default class Observer {
  constructor(callback, options) {
    const observer = (typeof window !== 'undefined' && window.IntersectionObserver) ?
      new window.IntersectionObserver(callback, options) : null;
    return observer;
  }
}
