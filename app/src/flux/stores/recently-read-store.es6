const MailspringStore = require('mailspring-store');
const ChangeUnreadTask = require('../tasks/change-unread-task');
const ChangeLabelsTask = require('../tasks/change-labels-task');
const ChangeFolderTask = require('../tasks/change-folder-task');
const Actions = require('../actions');

// The "Unread" view shows all threads which are unread. When you read a thread,
// it doesn't disappear until you leave the view and come back. This behavior
// is implemented by keeping track of messages being rea and manually
// whitelisting them in the query.

class RecentlyReadStore extends MailspringStore {
  constructor() {
    super();
    this.ids = [];
    this.listenTo(Actions.focusMailboxPerspective, () => {
      this.ids = [];
      this.trigger();
    });
    this.listenTo(Actions.queueTasks, tasks => {
      this.tasksQueued(tasks);
    });
    this.listenTo(Actions.queueTask, task => {
      this.tasksQueued([task]);
    });
  }

  tasksQueued(tasks) {
    let changed = false;

    tasks.filter(task => task instanceof ChangeUnreadTask).forEach(({ threadIds }) => {
      this.ids = this.ids.concat(threadIds);
      changed = true;
    });

    tasks
      .filter(task => task instanceof ChangeLabelsTask || task instanceof ChangeFolderTask)
      .forEach(({ threadIds }) => {
        this.ids = this.ids.filter(id => !threadIds.includes(id));
        changed = true;
      });

    if (changed) {
      this.trigger();
    }
  }
}

const store = new RecentlyReadStore();
module.exports = store;
