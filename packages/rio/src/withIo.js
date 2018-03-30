import React from 'react';

export default Consumer =>
  Component =>
    props => (
      <Consumer>
        {io => <Component {...props} io={io} />}
      </Consumer>
    );
