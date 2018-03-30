import React from 'react';
import Io from '@hrasoa/io';

export default (init) => {
  const intersectionObserver = new Io(init);
  return React.createContext(intersectionObserver);
};
