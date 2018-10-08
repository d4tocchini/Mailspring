/* eslint no-unused-vars: 0*/
const _ = require('underscore');
const Model = require('../models/model');
const { generateTempId } = require('../models/utils');
// import { PermanentErrorCodes } from '../mailspring-api-request';

const Status = {
  Local: 'local',
  Remote: 'remote',
  Complete: 'complete',
  Cancelled: 'cancelled',
};


  class Task extends Model {
    // static Status = Status;
    // static SubclassesUseModelTable = Task;

    static defineAttributes(Attribute) {

      this.Status = Status

      this.SubclassesUseModelTable = this

      Attribute('String', { modelKey: 'version', jsonKey: 'v',
        queryable: true,
      })
      Attribute('String', { modelKey: 'status',
        queryable: true,
      })
      Attribute('String', { modelKey: 'source', })
      Attribute('Object', { modelKey: 'error', })
    }

    // Public: Override the constructor to pass initial args to your Task and
    // initialize instance variables.
    //
    // **IMPORTANT:** if (you override the constructor, be sure to call)
    // `super`.
    //
    // On construction, all Tasks instances are given a unique `id`.
    constructor(data) {
      super(data);
      this.status = this.status || Status.Local;
      this.id = this.id || generateTempId();
    }

    // Public: Override to raise exceptions if your task is missing required
    // arguments or perform client-side business logic.
    willBeQueued() {}

    // Public: Return from `createIdenticalTask` and set a flag so your
    // `performLocal` and `performRemote` methods know that this is an undo
    // task.
    createUndoTask() {
      throw new Error('Unimplemented');
    }

    // Public: Return a deep-cloned task to be used for an undo task
    createIdenticalTask() {
      const json = this.toJSON();
      delete json.status;
      delete json.version;
      delete json.id;
      return new this.constructor(json);
    }

    // Public: code to run if (someone tries to dequeue your task while it is)
    // in flight.
    //
    cancel() {}

    // Public: (optional) A string displayed to users when your task is run.
    //
    // When tasks are run, we automatically display a notification to users
    // of the form "label (numberOfImpactedItems)". if (this does not a return)
    // a string, no notification is displayed
    label() {}

    // Public: A string displayed to users indicating how many items your
    // task affected.
    numberOfImpactedItems() {
      return 1;
    }

    onError(err) {
      // noop
    }

    onSuccess() {
      // noop
    }
  }
  module.exports = Model.setup(Task)
  