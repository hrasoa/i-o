import React, { Component } from 'react';
import context from './io-context';
import { withIo } from '../src';

/* eslint-disable */
class Sentinel extends Component {
  componentDidMount() {
    this.props.io.observe(this.ref, {
      onIntersection: (entry) => {
        if (!entry.isIntersecting) return;
        this.props.onIntersection();
      }
    });
  }

  render() {
    return (
      <div
        ref={(img) => { this.ref = img; }}
      />
    );
  }
}

export default withIo(context.Consumer)(Sentinel);
