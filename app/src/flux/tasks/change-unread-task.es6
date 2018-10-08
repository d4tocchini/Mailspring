/* eslint no-unused-vars: 0*/
const _ = require('underscore')
const Thread = require('../models/thread')
const Actions = require('../actions')
const DatabaseStore = require('../stores/database-store')
const ChangeMailTask = require('./change-mail-task')


  class ChangeUnreadTask extends ChangeMailTask {

    static defineAttributes (Attribute) {
      Attribute('Boolean', { modelKey: 'unread', })
    }

    label() {
      return this.unread ? 'Marking as unread' : 'Marking as read';
    }

    description() {
      const count = this.threadIds.length;
      const type = count > 1 ? 'threads' : 'thread';

      if (this.isUndo) {
        return `Undoing changes to ${count} ${type}`;
      }

      const newState = this.unread ? 'unread' : 'read';
      if (count > 1) {
        return `Marked ${count} ${type} as ${newState}`;
      }
      return `Marked as ${newState}`;
    }

    createUndoTask() {
      const task = super.createUndoTask();
      task.unread = !this.unread;
      return task;
    }
  }

  module.exports = ChangeMailTask.setup(ChangeUnreadTask)