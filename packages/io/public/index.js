import Io from '../src/io';
import './styles.css';

const sentinel = document.querySelector('.sentinel');
const list = document.querySelector('ul');
let j = 0;

const io = new Io({
  // Global callback for all the observers (lazy images)
  onIntersection: (entry, unobserve) => {
    entry.target.src = entry.target.getAttribute('data-src');
    unobserve();
  },
});

io.observe(sentinel, {
  // Excute the callback immediatly
  delay: 0,
  // Sepecific callback for this observer (infinite scroll)
  onIntersection: () => { addImages(10); }
});

function addImages(amount) {
  const frag = document.createDocumentFragment();
  const metaFrag = document.createDocumentFragment();
  let url, link, li, img;
  for (let i = 0; i < amount; i++) {
    url = 'https://picsum.photos/400/250?image=' + j;
    link = document.createElement('link');
    // Prefetch the image we are lazy loading
    link.setAttribute('rel', 'prefetch');
    link.setAttribute('as', 'image');
    link.href = url;
    li = document.createElement('li');
    img = document.createElement('img');
    img.setAttribute('data-src', url);
    img.className = 'lazy';
    li.appendChild(img);
    // Watch for the new image
    io.observe(img);
    frag.appendChild(li);
    metaFrag.appendChild(link);
    j++;
  }
  list.appendChild(frag);
  document.head.appendChild(metaFrag);
}
