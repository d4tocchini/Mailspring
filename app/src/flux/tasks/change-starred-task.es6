/* eslint no-unused-vars: 0*/
const _ = require('underscore');
const Thread = require('../models/thread');
const Actions = require('../actions');
const DatabaseStore = require('../stores/database-store');
const ChangeMailTask = require('./change-mail-task');

 class ChangeStarredTask extends ChangeMailTask {

    static defineAttributes (Attribute) {
      Attribute('Boolean', { modelKey: 'starred', })
    }

    label() {
      return this.starred ? 'Starring' : 'Unstarring';
    }

    description() {
      const count = this.threadIds.length;
      const type = count > 1 ? 'threads' : 'thread';

      if (this.isUndo) {
        return `Undoing changes to ${count} ${type}`;
      }

      const verb = this.starred ? 'Starred' : 'Unstarred';
      if (count > 1) {
        return `${verb} ${count} ${type}`;
      }
      return `${verb}`;
    }

    willBeQueued() {
      if (this.threadIds.length === 0) {
        throw new Error('ChangeStarredTask: You must provide a `threads` Array of models or IDs.');
      }
      super.willBeQueued();
    }

    createUndoTask() {
      const task = super.createUndoTask();
      task.starred = !this.starred;
      return task;
    }
  }

  module.exports = ChangeMailTask.setup(ChangeStarredTask)