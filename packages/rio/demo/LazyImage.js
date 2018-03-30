import React, { Component, Fragment } from 'react';
import Helmet from 'react-helmet-async';
import context from './io-context';
import { withObserver } from '../src';

/* eslint-disable */
class LazyImage extends Component {
  constructor(props) {
    super(props);
    this.state = { src: null, loaded: false };
    this.ref = React.createRef();
  }

  componentDidMount() {
    this.ref.current.onload = this.isLoaded.bind(this); 
    this.props.io.observe(this.ref.current, {
      onIntersection: (entry) => {
        if (!entry.isIntersecting) return;
        this.setState({ src: this.props.src });
        this.props.io.unobserve(entry.target);
      }
    });
  }

  isLoaded() {
    this.setState({ loaded: true });
  }

  render() {
    return (
      <Fragment>
        <Helmet>
          <link rel="prefetch" as="image" href={this.props.src} />
        </Helmet>
        <img
          src={this.state.src}
          alt="i will lazy load"
          className={`lazy${this.state.loaded ? ' is-loaded' : ''}`}
          ref={this.ref}
        />
      </Fragment>      
    );
  }
}

export default withObserver(context.Consumer)(LazyImage);
