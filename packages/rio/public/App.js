import React, { Component } from 'react';
import { hot } from 'react-hot-loader';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
    };
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
      <ul>
        {this.state.images.map(({ id, src }) =>
          (
            <li key={id}>
              <img className="lazy" data-src={src} alt="A placeholder" />
            </li>
          ))}
      </ul>
    );
  }
}

export default hot(module)(App);
