const Task = require('./task');

  class DestroyDraftTask extends Task {

    static defineAttributes(Attribute) {
      Attribute('Collection', { modelKey: 'messageIds',})
    }

    label() {
      return 'Deleting draft';
    }
  }

  module.exports = Task.setup(DestroyDraftTask)