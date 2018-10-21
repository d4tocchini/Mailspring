const Task = require('./task');
const {PRODUCT_NAME} = require('mailspring/CONFIG')

class SyncbackDraftTask extends Task {

  static defineAttributes(Attribute) {
    Attribute('String', { modelKey: 'headerMessageId', })
    Attribute('Object', { modelKey: 'draft',
      itemClass: require('../models/message'),
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
          `${PRODUCT_NAME} can't find your Drafts folder. To create and send mail, visit Preferences > Folders and choose a Drafts folder.`,
      });
    }
  }
}
module.exports = Task.setup(SyncbackDraftTask)