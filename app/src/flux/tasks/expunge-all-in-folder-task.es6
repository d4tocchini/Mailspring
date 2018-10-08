const Task = require('./task');
const Folder = require('../models/folder');

  class ExpungeAllInFolderTask extends Task {

    static defineAttributes(Attribute) {
      Attribute('Object', { modelKey: 'folder',
        itemClass: Folder,
      })
    }

    label() {
      return `Deleting all messages in ${this.folder ? this.folder.displayName : 'unknown'}`;
    }
  }
  module.exports = Task.setup(ExpungeAllInFolderTask)