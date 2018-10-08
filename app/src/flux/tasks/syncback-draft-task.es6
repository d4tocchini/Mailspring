const Task = require('./task');
const Message = require('../models/message');

const SyncbackDraftTask =
  module.exports =
  Task.setup(class extends Task {

    static defineAttributes(Attribute) {
      Attribute('String', { modelKey: 'headerMessageId', })
      Attribute('Object', { modelKey: 'draft',
        itemClass: Message,
      })
    }

    constructor({ draft, ...rest } = {}) {
      super(rest);
      this.draft = draft;
      this.accountId = (draft || {}).accountId;
      this.headerMessageId = (draft || {}).headerMessageId;
    }

    onError({ key, debuginfo }) {
      if (key === 'no-drafts-folder') {
        AppEnv.showErrorDialog({
          title: 'Drafts folder not found',
          message:
            "Mailspring can't find your Drafts folder. To create and send mail, visit Preferences > Folders and choose a Drafts folder.",
        });
      }
    }
  }
)