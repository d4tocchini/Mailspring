const ChangeFolderTask = require('./change-folder-task');
const ChangeLabelsTask = require('./change-labels-task');
const ChangeUnreadTask = require('./change-unread-task');
const ChangeStarredTask = require('./change-starred-task');
const CategoryStore = require('../stores/category-store');
const Thread = require('../models/thread');
const Label = require('../models/label');

const TaskFactory = {
  tasksForThreadsByAccountId(threads, callback) {
    const byAccount = {};
    threads.forEach(thread => {
      if (!(thread instanceof Thread)) {
        throw new Error('tasksForApplyingCategories: `threads` must be instances of Thread');
      }
      const { accountId } = thread;
      if (!byAccount[accountId]) {
        byAccount[accountId] = { accountThreads: [], accountId: accountId };
      }
      byAccount[accountId].accountThreads.push(thread);
    });

    const tasks = [];
    Object.values(byAccount).forEach(({ accountThreads, accountId }) => {
      const taskOrTasks = callback(accountThreads, accountId);
      if (taskOrTasks) {
        if (taskOrTasks instanceof Array) {
          tasks.push.apply(tasks, taskOrTasks);
        } else {
          tasks.push(taskOrTasks);
        }
      }
    });
    return tasks;
  },

  tasksForMarkingAsSpam({ threads, source }) {
    return this.tasksForThreadsByAccountId(threads, (accountThreads, accountId) => {
      return new ChangeFolderTask({
        folder: CategoryStore.getSpamCategory(accountId),
        threads: accountThreads,
        source,
      });
    });
  },

  tasksForMarkingNotSpam({ threads, source }) {
    return this.tasksForThreadsByAccountId(threads, (accountThreads, accountId) => {
      const inbox = CategoryStore.getInboxCategory(accountId);
      if (inbox instanceof Label) {
        return new ChangeFolderTask({
          folder: CategoryStore.getAllMailCategory(accountId),
          threads: accountThreads,
          source,
        });
      }
      return new ChangeFolderTask({
        folder: inbox,
        threads: accountThreads,
        source,
      });
    });
  },

  tasksForArchiving({ threads, source }) {
    return this.tasksForThreadsByAccountId(threads, (accountThreads, accountId) => {
      const inbox = CategoryStore.getInboxCategory(accountId);
      if (inbox instanceof Label) {
        return new ChangeLabelsTask({
          labelsToRemove: [inbox],
          labelsToAdd: [],
          threads: accountThreads,
          source,
        });
      }
      return new ChangeFolderTask({
        folder: CategoryStore.getArchiveCategory(accountId),
        threads: accountThreads,
        source,
      });
    });
  },

  tasksForMovingToTrash({ threads, source }) {
    return this.tasksForThreadsByAccountId(threads, (accountThreads, accountId) => {
      return new ChangeFolderTask({
        folder: CategoryStore.getTrashCategory(accountId),
        threads: accountThreads,
        source,
      });
    });
  },

  taskForInvertingUnread({ threads, source, canBeUndone }) {
    const unread = threads.every(t => t.unread === false);
    return new ChangeUnreadTask({ threads, unread, source, canBeUndone });
  },

  taskForSettingUnread({ threads, unread, source, canBeUndone }) {
    return new ChangeUnreadTask({ threads, unread, source, canBeUndone });
  },

  taskForInvertingStarred({ threads, source }) {
    const starred = threads.every(t => t.starred === false);
    return new ChangeStarredTask({ threads, starred, source });
  },
};

module.exports = TaskFactory;
