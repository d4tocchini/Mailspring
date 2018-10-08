const utf7 = require('utf7');
const Task = require('./task');

const SyncbackCategoryTask =
  module.exports =
  Task.setup(class extends Task {

    static defineAttributes(Attribute) {

      Attribute('String', { modelKey: 'path', })

      Attribute('String', { modelKey: 'existingPath', })

      Attribute('Object', { modelKey: 'created', })
    }

    static forCreating({ name, accountId }) {
      return new SyncbackCategoryTask({
        path: utf7.imap.encode(name),
        accountId: accountId,
      });
    }

    static forRenaming({ path, accountId, newName }) {
      return new SyncbackCategoryTask({
        existingPath: path,
        path: utf7.imap.encode(newName),
        accountId: accountId,
      });
    }

    label() {
      return this.existingPath
        ? `Renaming ${utf7.imap.decode(this.existingPath)}`
        : `Creating ${utf7.imap.decode(this.path)}`;
    }
  }
)