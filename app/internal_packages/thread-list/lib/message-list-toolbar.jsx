import React from 'react';
import PropTypes from 'prop-types';
import CSSTransitionGroup from '../../../src/components/CSSTransitionGroup';
import { Rx, FocusedContentStore } from 'mailspring-exports';
import ThreadListStore from './thread-list-store';
import InjectsToolbarButtons from './injects-toolbar-buttons';
const {ToolbarRole} = InjectsToolbarButtons

function getObservable() {
  return Rx.Observable.combineLatest(
    Rx.Observable.fromStore(FocusedContentStore),
    ThreadListStore.selectionObservable(),
    (store, items) => ({ focusedThread: store.focused('thread'), items })
  ).map(({ focusedThread, items }) => {
    if (focusedThread) {
      return [focusedThread];
    }
    return items;
  });
}

const MessageListToolbar = ({ items, injectedButtons }) => {
  const shouldRender = items.length > 0;

  return (
    <CSSTransitionGroup
      className="message-toolbar-items"
      transitionLeaveTimeout={125}
      transitionEnterTimeout={125}
      transitionName="opacity-125ms"
    >
      {shouldRender ? injectedButtons : undefined}
    </CSSTransitionGroup>
  );
};
MessageListToolbar.displayName = 'MessageListToolbar';
MessageListToolbar.propTypes = {
  items: PropTypes.array,
  injectedButtons: PropTypes.element,
};

const toolbarProps = {
  getObservable,
  extraRoles: [`MessageList:${ToolbarRole}`],
};

module.exports = InjectsToolbarButtons(MessageListToolbar, toolbarProps);
