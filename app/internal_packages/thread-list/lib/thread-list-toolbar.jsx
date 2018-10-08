import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MultiselectToolbar } from 'mailspring-component-kit';
import InjectsToolbarButtons from './injects-toolbar-buttons';
const {ToolbarRole} = InjectsToolbarButtons

class ThreadListToolbar extends Component {
  static displayName = 'ThreadListToolbar';

  static propTypes = {
    items: PropTypes.array,
    selection: PropTypes.shape({
      clear: PropTypes.func,
    }),
    injectedButtons: PropTypes.element,
  };

  onClearSelection = () => {
    this.props.selection.clear();
  };

  render() {
    const { injectedButtons, items } = this.props;

    return (
      <MultiselectToolbar
        collection="thread"
        selectionCount={items.length}
        toolbarElement={injectedButtons}
        onClearSelection={this.onClearSelection}
      />
    );
  }
}

const toolbarProps = {
  extraRoles: [`ThreadList:${ToolbarRole}`],
};

module.exports = InjectsToolbarButtons(ThreadListToolbar, toolbarProps);
