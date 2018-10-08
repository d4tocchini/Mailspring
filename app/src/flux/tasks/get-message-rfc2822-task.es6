
const Task = require('./task');

  class GetMessageRFC2822Task extends Task {
    static defineAttributes(Attribute) {
      Attribute('String', { modelKey: 'messageId', })
      Attribute('String', { modelKey: 'filepath', })
    }
  }
  module.exports = Task.setup(GetMessageRFC2822Task)
