import React, { Component } from 'react';
import context from './io-context';
import { withIo } from '../src';

/* eslint-disable */
class LazyImage extends Component {
  componentDidMount() {
    this.props.io.observe(this.ref, {
      onIntersection: (entry) => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute('src', entry.target.getAttribute('data-src'));
        this.props.io.unobserve(entry.target);
      }
    });
  }

  render() {
    return (
      <img
        alt="i will lazy load"
        className="lazy"
        ref={(img) => { this.ref = img; }}
        data-src={this.props.src}
      />
    );
  }
}

export default withIo(context.Consumer)(LazyImage);
