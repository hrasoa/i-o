import Io from './io';

const io = new Io();
const images = Array.from(document.querySelectorAll('img'));

const loadImage = (e) => {
  e.target.src = e.target.getAttribute('data-src');
};

io.observe(images[0], loadImage);
io.observe(images[1], loadImage);
