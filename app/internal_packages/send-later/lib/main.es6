const {
  ComponentRegistry,
  DatabaseStore,
  DraftStore,
  Message,
  SyncbackMetadataTask,
  SendActionsStore,
  Actions,
} = require('mailspring-exports');
const { HasTutorialTip } = require('mailspring-component-kit');
const SendLaterButton = require('./send-later-button');
const SendLaterStatus = require('./send-later-status');
const { PLUGIN_ID } = require('./send-later-constants');

let unlisten = null;

const SendLaterButtonWithTip = HasTutorialTip(SendLaterButton, {
  title: 'Send on your own schedule',
  instructions:
    'Schedule this message to send at the ideal time.',// Mailspring makes it easy to control the fabric of spacetime!',
});

function handleMetadataExpiration(change) {
  if (change.type !== 'metadata-expiration' || change.objectClass !== Message.name) {
    return;
  }

  change.objects.forEach(async message => {
    // debugger
    const metadata = message.metadataForPluginId(PLUGIN_ID);
    if (!metadata || !metadata.expiration || metadata.expiration > new Date()) {
      return;
    }

    if (!message.draft) {
      Actions.queueTask(
        SyncbackMetadataTask.forSaving({
          model: message,
          pluginId: PLUGIN_ID,
          value: {
            expiration: null,
          },
        })
      );
      return;
    }

    // clear the metadata
    const session = await DraftStore.sessionForClientId(message.headerMessageId);
    session.changes.addPluginMetadata(PLUGIN_ID, { expiration: null });
    session.changes.commit();

    // send the draft
    const actionKey = metadata.actionKey || SendActionsStore.DefaultSendActionKey;
    Actions.sendDraft(message.headerMessageId, { actionKey, delay: 0 });
  });
}

export function activate() {
  ComponentRegistry.register(SendLaterButtonWithTip, { role: 'Composer:ActionButton' });
  ComponentRegistry.register(SendLaterStatus, { role: 'DraftList:DraftStatus' });

  if (AppEnv.isMainWindow()) {
    unlisten = DatabaseStore.listen(handleMetadataExpiration);
  }
}

export function deactivate() {
  ComponentRegistry.unregister(SendLaterButtonWithTip);
  ComponentRegistry.unregister(SendLaterStatus);
  if (unlisten) {
    unlisten();
  }
}

export function serialize() {}
