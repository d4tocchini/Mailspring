const utf7 = require('utf7');
const Task = require('./task');

class DestroyCategoryTask extends Task {

    static defineAttributes (Attribute) {
      Attribute('String', { modelKey: 'path', })
    }

    label() {
      return `Deleting ${utf7.imap.decode(this.path)}`;
    }
  }

module.exports = Task.setup(DestroyCategoryTask)