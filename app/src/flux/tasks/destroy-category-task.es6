import utf7 from 'utf7';
const Task = require('./task');

const DestroyCategoryTask =
  module.exports = Task.setup(
  class extends Task {

    static defineAttributes (Attribute) {
      Attribute('String', { modelKey: 'path', })
    }

    label() {
      return `Deleting ${utf7.imap.decode(this.path)}`;
    }
  }
)