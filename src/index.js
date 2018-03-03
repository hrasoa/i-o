import Io from './io';

const images = Array.from(document.querySelectorAll('img'));

const lazyImages = new Io({
  onIntersection: (entry) => {
    entry.target.setAttribute('src', entry.target.getAttribute('data-src'));
  },
});

lazyImages.observe(images[0]);
lazyImages.observe(images[1]);
