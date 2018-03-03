class Observer {
  constructor(cb, options) {
    const intersectionObserver = new IntersectionObserver(cb, options);
    return intersectionObserver;
  }
}

export default Observer;
