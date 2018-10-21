const Reflux = require('reflux');

const ActionScopeWindow = 'window';
const ActionScopeGlobal = 'global';
const ActionScopeMainWindow = 'main';

/*
Public: In the Flux {Architecture.md}, almost every user action
is translated into an Action object and fired globally. Stores in the app observe
these actions and perform business logic. This loose coupling means that your
packages can observe actions and perform additional logic, or fire actions which
the rest of the app will handle.

In Reflux, each {Action} is an independent object that acts as an event emitter.
You can listen to an Action, or invoke it as a function to fire it.

## Action Scopes

This is a multi-window application. The `scope` of an Action dictates
how it propogates between windows.

- **Global**: These actions can be listened to from any window and fired from any
  window. The action is sent from the originating window to all other windows via
  IPC, so they should be used with care. Firing this action from anywhere will
  cause all listeners in all windows to fire.

- **Main Window**: You can fire these actions in any window. They'll be sent
  to the main window and triggered there.

- **Window**: These actions only trigger listeners in the window they're fired in.

## Firing Actions

```javascript
Actions.queueTask(new ChangeStarredTask(threads: [this._thread], starred: true))
```

## Listening for Actions

If you're using Reflux to create your own Store, you can use the `listenTo`
convenience method to listen for an Action. If you're creating your own class
that is not a Store, you can still use the `listen` method provided by Reflux:

```javascript
setup() {
  this.unlisten = Actions.queueTask.listen(this.onTaskWasQueued, this)
}
onNewMailReceived = (data) => {
  console.log("You've got mail!", data)
}
teardown() {
  this.unlisten();
}
```

Section: General
*/

const ACTIONS = {

  /*
  Public: Fired when the Nylas API Connector receives new data from the API.

  *Scope: Global*

  Receives an {Object} of {Array}s of {Model}s, for example:

  ```json
  {
    'thread': [<Thread>, <Thread>]
    'contact': [<Contact>]
  }
  ```
  */
 downloadStateChanged: ActionScopeGlobal,

  /*
  Public: Queue a {Task} object to the {TaskQueue}.

  *Scope: Main Window*
  */
 queueTask: ActionScopeMainWindow,

  /*
  Public: Queue multiple {Task} objects to the {TaskQueue}, which should be
  undone as a single user action.

  *Scope: Main Window*
  */
 queueTasks: ActionScopeMainWindow,
  /*
  Public: Cancel a specific {Task} in the {TaskQueue}.

  *Scope: Main Window*
  */
 cancelTask: ActionScopeMainWindow,

  /*
  Public: Queue a task that does not require processing, placing it on the undo stack only.
  *Scope: Main Window*
  */
 queueUndoOnlyTask: ActionScopeMainWindow,

  /*
  Public: Dequeue a {Task} matching the description provided.

  *Scope: Main Window*
  */
 checkOnlineStatus: ActionScopeWindow,

  /*
  Public: Open the preferences view.

  *Scope: Global*
  */
 openPreferences: ActionScopeGlobal,

  /*
  Public: Switch to the preferences tab with the specific name

  *Scope: Global*
  */
 switchPreferencesTab: ActionScopeGlobal,

  /*
  Public: Manage the Nylas identity
  */
 logoutNylasIdentity: ActionScopeWindow,

  /*
  Public: Remove the selected account

  *Scope: Window*
  */
 removeAccount: ActionScopeWindow,

  /*
  Public: Update the provided account

  *Scope: Window*

  ```
  Actions.updateAccount(account.id, {accountName: 'new'})
  ```
  */
 updateAccount: ActionScopeWindow,

  /*
  Public: Re-order the provided account in the account list.

  *Scope: Window*

  ```
  Actions.reorderAccount(account.id, newIndex)
  ```
  */
 reorderAccount: ActionScopeWindow,

  /*
  Public: Select the provided sheet in the current window. This action changes
  the top level sheet.

  *Scope: Window*

  ```
  Actions.selectRootSheet(WorkspaceStore.Sheet.Threads)
  ```
  */
 selectRootSheet: ActionScopeWindow,

  /*
  Public: Toggle whether a particular column is visible. Call this action
  with one of the Sheet location constants:

  ```
  Actions.toggleWorkspaceLocationHidden(WorkspaceStore.Location.MessageListSidebar)
  ```
  */
 toggleWorkspaceLocationHidden: ActionScopeWindow,

  /*
  Public: Focus the keyboard on an item in a collection. This action moves the
  `keyboard focus` element in lists and other components,  but does not change
  the focused DOM element.

  *Scope: Window*

  ```
  Actions.setCursorPosition(collection: 'thread', item: <Thread>)
  ```
  */
 setCursorPosition: ActionScopeWindow,

  /*
  Public: Focus on an item in a collection. This action changes the selection
  in lists and other components, but does not change the focused DOM element.

  *Scope: Window*

  ```
  Actions.setFocus(collection: 'thread', item: <Thread>)
  ```
  */
 setFocus: ActionScopeWindow,

  /*
  Public: Focus the interface on a specific {MailboxPerspective}.

  *Scope: Window*

  ```
  Actions.focusMailboxPerspective(<Category>)
  ```
  */
 focusMailboxPerspective: ActionScopeWindow,

  /*
  Public: Focus the interface on the default mailbox perspective for the provided
  account id.

  *Scope: Window*
  */
 focusDefaultMailboxPerspectiveForAccounts: ActionScopeWindow,

  /*
  Public: Focus the mailbox perspective for the given account id and category names

  *Scope: Window*

  ```
  Actions.ensureCategoryIsFocused(accountIds, categoryName)
  ```
  */
 ensureCategoryIsFocused: ActionScopeWindow,

  /*
  Public: If the message with the provided id is currently beign displayed in the
  thread view, this action toggles whether it's full content or snippet is shown.

  *Scope: Window*

  ```
  message: <Message>
  Actions.toggleMessageIdExpanded(message.id)
  ```
  */
 toggleMessageIdExpanded: ActionScopeWindow,

  /*
  Public: Toggle whether messages from trash and spam are shown in the current
  message view.
  */
 toggleHiddenMessages: ActionScopeWindow,

  /*
  Public: This action toggles wether to collapse or expand all messages in a
  thread depending on if there are currently collapsed messages.

  *Scope: Window*

  ```
  Actions.toggleAllMessagesExpanded()
  ```
  */
 toggleAllMessagesExpanded: ActionScopeWindow,

  /*
  Public: Print the currently selected thread.

  *Scope: Window*

  ```
  thread = <Thread>
  Actions.printThread(thread)
  ```
  */
  printThread: ActionScopeWindow,

  /*
  Public: Display the thread in a new popout window

  *Scope: Window*

  ```
  thread = <Thread>
  Actions.popoutThread(thread)
  ```
  */
  popoutThread: ActionScopeWindow,

  /*
  Public: Display the thread in the main window

  *Scope: Global*

  ```
  thread = <Thread>
  Actions.focusThreadMainWindow(thread)
  ```
  */
  focusThreadMainWindow: ActionScopeGlobal,

  /*
  Public: Create a new reply to the provided threadId and messageId and populate
  it with the body provided.

  *Scope: Window*

  ```
  message = <Message>
  Actions.sendQuickReply({threadId: '123', messageId: '234'}, "Thanks Ben!")
  ```
  */
  sendQuickReply: ActionScopeWindow,

  /*
  Public: Create a new reply to the provided threadId and messageId. Note that
  this action does not focus on the thread, so you may not be able to see the new draft
  unless you also call {::setFocus}.

  *Scope: Window*

  ```
  * Compose a reply to the last message in the thread
  Actions.composeReply({threadId: '123'})

  * Compose a reply to a specific message in the thread
  Actions.composeReply({threadId: '123', messageId: '123'})
  ```
  */
  composeReply: ActionScopeWindow,

  /*
  Public: Create a new draft for forwarding the provided threadId and messageId. See
  {::composeReply} for parameters and behavior.

  *Scope: Window*
  */
  composeForward: ActionScopeWindow,

  /*
  Public: Pop out the draft with the provided ID so the user can edit it in another
  window.

  *Scope: Window*

  ```
  messageId = '123'
  Actions.composePopoutDraft(messageId)
  ```
  */
  composePopoutDraft: ActionScopeWindow,

  /*
  Public: Open a new composer window for creating a new draft from scratch.

  *Scope: Window*

  ```
  Actions.composeNewBlankDraft()
  ```
  */
  composeNewBlankDraft: ActionScopeWindow,

  /*
  Public: Open a new composer window for a new draft addressed to the given recipient

  *Scope: Window*

  ```
  Actions.composeNewDraftToRecipient(contact)
  ```
  */
  composeNewDraftToRecipient: ActionScopeWindow,

  /*
  Public: Send the draft with the given ID. This Action is handled by the {DraftStore},
  which finalizes the {DraftChangeSet} and allows {ComposerExtension}s to display
  warnings and do post-processing. To change send behavior, you should consider using
  one of these objects rather than listening for the {sendDraft} action.

  *Scope: Window*

  ```
  Actions.sendDraft('123', {actionKey})
  ```
  */
  sendDraft: ActionScopeWindow,
  /*
  Public: Fired when a draft is successfully sent
  *Scope: Global*

  Recieves the id of the message that was sent
  */
  draftDeliverySucceeded: ActionScopeMainWindow,
  draftDeliveryFailed: ActionScopeMainWindow,

  /*
  Public: Destroys the draft with the given ID. This Action is handled by the {DraftStore},
  and does not display any confirmation UI.

  *Scope: Window*
  */
  destroyDraft: ActionScopeWindow,

  /*
  Public: Submits the user's response to an RSVP event.

  *Scope: Window*
  */
  RSVPEvent: ActionScopeWindow,

  // FullContact Sidebar
  getFullContactDetails: ActionScopeWindow,
  focusContact: ActionScopeWindow,

  // Account Sidebar
  setCollapsedSidebarItem: ActionScopeWindow,

  // File Actions
  // Some file actions only need to be processed in their current window
  addAttachment: ActionScopeWindow,
  selectAttachment: ActionScopeWindow,
  removeAttachment: ActionScopeWindow,

  fetchBodies: ActionScopeMainWindow,
  fetchAndOpenFile: ActionScopeWindow,
  fetchAndSaveFile: ActionScopeWindow,
  fetchAndSaveAllFiles: ActionScopeWindow,
  fetchFile: ActionScopeWindow,
  abortFetchFile: ActionScopeWindow,

  /*
  Public: Pop the current sheet off the Sheet stack maintained by the {WorkspaceStore}.
  This action has no effect if the window is currently showing a root sheet.

  *Scope: Window*
  */
  popSheet: ActionScopeWindow,

  /*
  Public: Pop the to the root sheet currently selected.

  *Scope: Window*
  */
  popToRootSheet: ActionScopeWindow,

  /*
  Public: Push a sheet of a specific type onto the Sheet stack maintained by the
  {WorkspaceStore}. Note that sheets have no state. To show a *specific* thread,
  you should push a Thread sheet and call `setFocus` to select the thread.

  *Scope: Window*

  ```javascript
  WorkspaceStore.defineSheet('Thread', {}, {
    list: ['MessageList', 'MessageListSidebar'],
  }),

  ...

  this.pushSheet(WorkspaceStore.Sheet.Thread)
  ```
  */
  pushSheet: ActionScopeWindow,

  addMailRule: ActionScopeWindow,
  reorderMailRule: ActionScopeWindow,
  updateMailRule: ActionScopeWindow,
  deleteMailRule: ActionScopeWindow,
  disableMailRule: ActionScopeWindow,
  startReprocessingMailRules: ActionScopeWindow,
  stopReprocessingMailRules: ActionScopeWindow,

  openPopover: ActionScopeWindow,
  closePopover: ActionScopeWindow,

  openModal: ActionScopeWindow,
  closeModal: ActionScopeWindow,

  draftParticipantsChanged: ActionScopeWindow,

  findInThread: ActionScopeWindow,
  nextSearchResult: ActionScopeWindow,
  previousSearchResult: ActionScopeWindow,

  // Actions for the signature preferences and shared with the composer
  upsertSignature: ActionScopeWindow,
  removeSignature: ActionScopeWindow,
  selectSignature: ActionScopeWindow,
  toggleAccount: ActionScopeWindow,

  expandSyncState: ActionScopeWindow,

  searchQuerySubmitted: ActionScopeWindow,
  searchQueryChanged: ActionScopeWindow,
  searchCompleted: ActionScopeWindow,
}

const ACTION_KEYS = Object.keys(ACTIONS)
const ACTIONS_LENGTH = ACTION_KEYS.length

class Actions {}

// Read the actions we declared on the dummy Actions object above
// and translate them into Reflux Actions

// This helper method exists to trick the Donna lexer so it doesn't
// try to understand what we're doing to the Actions object.
const create = (obj, name, scope) => {
  obj[name] = Reflux.createAction(name);
  obj[name].scope = scope;
  obj[name].sync = true;
};

const scopes = {
  window: [],
  global: [],
  main: [],
};

for (var i = 0; i < ACTIONS_LENGTH; i++) {
  const name = ACTION_KEYS[i]
  const scope = ACTIONS[name]
  scopes[scope].push(name);
  create(Actions, name, scope);
}

// for (const name of Object.getOwnPropertyNames(Actions)) {
//   if (
//     name === 'length' ||
//     name === 'name' ||
//     name === 'arguments' ||
//     name === 'caller' ||
//     name === 'prototype'
//   ) {
//     continue;
//   }
//   if (Actions[name] !== 'window' && Actions[name] !== 'global' && Actions[name] !== 'main') {
//     continue;
//   }
//   const scope = Actions[name];
//   scopes[scope].push(name);
//   create(Actions, name, scope);
// }

Actions.windowActions = scopes.window;
Actions.mainWindowActions = scopes.main;
Actions.globalActions = scopes.global;

module.exports = Actions;
