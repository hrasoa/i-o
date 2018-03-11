import React, { Component } from 'react';
import { hot } from 'react-hot-loader';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [
        { id: 0, src: 'https://picsum.photos/400/250?image=0' },
      ],
    };
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
