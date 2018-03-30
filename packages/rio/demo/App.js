import React, { Component, Fragment } from 'react';
import { hot } from 'react-hot-loader';
import '@hrasoa/io/demo/styles.css';
import LazyImage from './LazyImage';
import Sentinel from './Sentinel';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
    };
    this.addImages = this.addImages.bind(this);
  }

  addImages() {
    const amount = 10;
    const images = [];
    const count = this.state.images.length;
    for (let i = 0; i < amount; i += 1) {
      images.push({ id: count + i, src: `https://picsum.photos/400/250?image=${count + i}` });
    }
    this.setState(prevState => ({
      images: [...prevState.images, ...images],
    }));
  }

  render() {
    return (
      <Fragment>
        <ul>
          {this.state.images.map(({ id, src }) =>
            (
              <li key={id}>
                <LazyImage src={src} />
              </li>
            ))}
        </ul>
        <Sentinel onIntersection={this.addImages} />
      </Fragment>
    );
  }
}

export default hot(module)(App);
