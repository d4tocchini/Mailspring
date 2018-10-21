const Task = require('./task');



  class SyncbackMetadataTask extends Task {

    static forSaving({ model, pluginId, value, undoValue }) {
      if (!pluginId) {
        throw new Error('SyncbackMetadataTask.forSaving: You must specify a pluginId.');
      }
      const task = new SyncbackMetadataTask({
        modelId: model.id,
        pluginId: pluginId,
        modelClassName: model.constructor.name.toLowerCase(),
        modelHeaderMessageId: model.headerMessageId || null,
        accountId: model.accountId,
        value,
        undoValue,
      });

      if (value && value.expiration) {
        const ts = new Date(value.expiration).getTime();
        task.value.expiration = Math.round(ts > 1000000000000 ? ts / 1000 : ts);
      }
      if (undoValue && undoValue.expiration) {
        const ts = new Date(undoValue.expiration).getTime();
        task.undoValue.expiration = Math.round(ts > 1000000000000 ? ts / 1000 : ts);
      }

      return task;
    }

    static defineAttributes(Attribute) {

      Attribute('String', { modelKey: 'pluginId', })
      Attribute('String', { modelKey: 'modelId', })
      Attribute('String', { modelKey: 'modelClassName', })
      Attribute('String', { modelKey: 'modelHeaderMessageId', })
      Attribute('Object', { modelKey: 'value', })
      Attribute('Object', { modelKey: 'undoValue', })
    }

    get canBeUndone() {
      return !!this.undoValue;
    }

    description() {
      return null;
    }

    createUndoTask() {
      const task = this.createIdenticalTask();
      const { value, undoValue } = task;
      task.value = undoValue;
      task.undoValue = value;
      return task;
    }
  }

  module.exports = Task.setup(SyncbackMetadataTask)
