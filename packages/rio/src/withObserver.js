import React from 'react';

export default ContextComponent =>
  Component =>
    props => (
      <ContextComponent>
        {io => <Component {...props} io={io} />}
      </ContextComponent>
    );
