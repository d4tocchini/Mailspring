import React from 'react';

module.exports = function CreateButtonGroup(name, buttons, { order = 0 }) {
  const fn = props => {
    return (
      <div className="button-group" style={{ order }}>
        {buttons.map(Component => <Component key={Component.displayName} {...props} />)}
      </div>
    );
  };
  fn.displayName = name;
  return fn;
}
