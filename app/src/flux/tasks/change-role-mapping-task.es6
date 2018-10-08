
const Task = require('./task');

  class ChangeRoleMappingTask extends Task {

    static defineAttributes(Attribute) {
      Attribute('String', { modelKey: 'path', })
      Attribute('String', { modelKey: 'role', })
    }

    label() {
      return `Changing folder mapping...`;
    }
  }
  module.exports = Task.setup(ChangeRoleMappingTask)
  