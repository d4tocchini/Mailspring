const { ComponentRegistry, WorkspaceStore } = require('mailspring-exports');
let ThreadList;
let ThreadListToolbar;
let ThreadListEmptyFolderBar;
let MessageListToolbar;
let SelectedItemsStack;
let ThreadToolbarButtons;

exports.activate = activate;
exports.deactivate = NOOP;

function NOOP() {}

function activate() {
  exports.activate = NOOP;
  exports.deactivate = deactivate;
  ThreadList = require('./thread-list');
  ThreadListToolbar = require('./thread-list-toolbar');
  ThreadListEmptyFolderBar = require('./thread-list-empty-folder-bar');
  MessageListToolbar = require('./message-list-toolbar');
  SelectedItemsStack = require('./selected-items-stack');
  ThreadToolbarButtons = require('./thread-toolbar-buttons');
  let { UpButton, DownButton, MoveButtons, FlagButtons } = ThreadToolbarButtons;

  function deactivate() {
    exports.activate = activate;
    exports.deactivate = NOOP;
    ComponentRegistry.unregister(ThreadList);
    ComponentRegistry.unregister(SelectedItemsStack);
    ComponentRegistry.unregister(ThreadListToolbar);
    ComponentRegistry.unregister(MessageListToolbar);
    ComponentRegistry.unregister(MoveButtons);
    ComponentRegistry.unregister(FlagButtons);
    ComponentRegistry.unregister(UpButton);
    ComponentRegistry.unregister(DownButton);
  }

  ComponentRegistry.register(ThreadListEmptyFolderBar, {
    location: WorkspaceStore.Location.ThreadList,
  });

  ComponentRegistry.register(ThreadList, {
    location: WorkspaceStore.Location.ThreadList,
  });

  ComponentRegistry.register(SelectedItemsStack, {
    location: WorkspaceStore.Location.MessageList,
    modes: ['split'],
  });

  // Toolbars
  ComponentRegistry.register(ThreadListToolbar, {
    location: WorkspaceStore.Location.ThreadList.Toolbar,
    modes: ['list'],
  });

  ComponentRegistry.register(MessageListToolbar, {
    location: WorkspaceStore.Location.MessageList.Toolbar,
  });

  ComponentRegistry.register(DownButton, {
    location: WorkspaceStore.Location.MessageList.Toolbar,
    modes: ['list'],
  });

  ComponentRegistry.register(UpButton, {
    location: WorkspaceStore.Location.MessageList.Toolbar,
    modes: ['list'],
  });

  ComponentRegistry.register(MoveButtons, {
    role: 'ThreadActionsToolbarButton',
  });

  ComponentRegistry.register(FlagButtons, {
    role: 'ThreadActionsToolbarButton',
  });
}
