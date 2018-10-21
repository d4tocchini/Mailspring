const MailspringStore = require('mailspring-store');
const SendDraftTask = require('../tasks/send-draft-task');
const SyncbackDraftTask = require('../tasks/syncback-draft-task');
const TaskQueue = require('./task-queue');

class OutboxStore extends MailspringStore {
  constructor() {
    super();
    this._tasks = [];
    this.listenTo(TaskQueue, this._populate);
    this._populate();
  }

  _populate() {
    const nextTasks = TaskQueue.queue().filter(
      task => task instanceof SendDraftTask || task instanceof SyncbackDraftTask
    );
    if (this._tasks.length === 0 && nextTasks.length === 0) {
      return;
    }
    this._tasks = nextTasks;
    this.trigger();
  }

  itemsForAccount(accountId) {
    return this._tasks.filter(task => task.draftAccountId === accountId);
  }
}

const store = new OutboxStore();
module.exports = store;
