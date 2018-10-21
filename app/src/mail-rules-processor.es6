const _ = require('underscore');
const Actions = require('./flux/actions');
const Task = require('./flux/tasks/task');
const Thread = require('./flux/models/thread');
const Folder = require('./flux/models/folder');
const Label = require('./flux/models/label');
const CategoryStore = require('./flux/stores/category-store');
const DatabaseStore = require('./flux/stores/database-store');
const TaskQueue = require('./flux/stores/task-queue');
const { ConditionMode, ConditionTemplates } = require('./mail-rules-templates');
const ChangeUnreadTask = require('./flux/tasks/change-unread-task');
const ChangeFolderTask = require('./flux/tasks/change-folder-task');
const ChangeStarredTask = require('./flux/tasks/change-starred-task');
const ChangeLabelsTask = require('./flux/tasks/change-labels-task');
let MailRulesStore = null;

/**
Note: At first glance, it seems like these task factory methods should use the
TaskFactory. Unfortunately, the TaskFactory uses the CategoryStore and other
information about the current view. Maybe after the unified inbox refactor...
*/
const MailRulesActions = {
  markAsImportant: async (message, thread) => {
    const important = CategoryStore.getCategoryByRole(thread.accountId, 'important');
    if (!important) {
      throw new Error('Could not find `important` label');
    }
    return new ChangeLabelsTask({
      labelsToAdd: [important],
      labelsToRemove: [],
      threads: [thread],
      source: 'Mail Rules',
    });
  },

  moveToTrash: async (message, thread) => {
    const folder = CategoryStore.getTrashCategory(thread.accountId);
    if (!folder) {
      throw new Error('Could not find `trash` folder');
    }
    return new ChangeFolderTask({
      folder: folder,
      threads: [thread],
      source: 'Mail Rules',
    });
  },

  markAsRead: (message, thread) => {
    if (thread.unread === false) {
      return null;
    }
    return new ChangeUnreadTask({
      unread: false,
      threads: [thread],
      source: 'Mail Rules',
    });
  },

  star: (message, thread) => {
    if (thread.starred === true) {
      return null;
    }
    return new ChangeStarredTask({
      starred: true,
      threads: [thread],
      source: 'Mail Rules',
    });
  },

  changeFolder: async (message, thread, value) => {
    if (!value) {
      throw new Error('A folder is required.');
    }
    const folder = CategoryStore.byId(thread.accountId, value);
    if (!folder || !(folder instanceof Folder)) {
      throw new Error('The folder could not be found.');
    }
    return new ChangeFolderTask({
      folder: folder,
      threads: [thread],
      source: 'Mail Rules',
    });
  },

  applyLabel: async (message, thread, value) => {
    if (!value) {
      throw new Error('A label is required.');
    }
    const label = CategoryStore.byId(thread.accountId, value);
    if (!label || !(label instanceof Label)) {
      throw new Error('The label could not be found.');
    }
    return new ChangeLabelsTask({
      labelsToAdd: [label],
      labelsToRemove: [],
      threads: [thread],
      source: 'Mail Rules',
    });
  },

  archive: (message, thread) => {
    return new ChangeLabelsTask({
      labelsToAdd: [],
      labelsToRemove: [CategoryStore.getInboxCategory(thread.accountId)],
      threads: [thread],
      source: 'Mail Rules',
    });
  },

  moveToLabel: async (message, thread, roleOrId) => {
    if (!roleOrId) {
      throw new Error('A label is required.');
    }

    const label = CategoryStore.categories(thread.accountId).find(
      c => c.id === roleOrId || c.role === roleOrId
    );

    if (!label || !(label instanceof Label)) {
      throw new Error('The label could not be found.');
    }
    return new ChangeLabelsTask({
      source: 'Mail Rules',
      labelsToRemove: []
        .concat(thread.labels)
        .filter(l => !l.isLockedCategory() && l.id !== label.id),
      labelsToAdd: [label],
      threads: [thread],
    });
  },
};

class MailRulesProcessor {
  async processMessages(messages) {
    MailRulesStore = MailRulesStore || require('./flux/stores/mail-rules-store'); //eslint-disable-line
    if (messages.length === 0) {
      return;
    }

    const enabledRules = MailRulesStore.rules().filter(r => !r.disabled);

    // When messages arrive, we process all the messages in parallel, but one
    // rule at a time. This is important, because users can order rules which
    // may do and undo a change. Ie: "Star if from Ben, Unstar if subject is "Bla"
    for (const rule of enabledRules) {
      let matching = messages.filter(message => this._checkRuleForMessage(rule, message));

      // Rules are declared at the message level, but actions are applied to
      // threads. To ensure we don't apply the same action 50x on the same thread,
      // just process one match per thread.
      matching = _.uniq(matching, false, message => message.threadId);
      for (const message of matching) {
        // We always pull the thread from the database, even though it may be in
        // `incoming.thread`, because rules may be modifying it as they run!
        const thread = await DatabaseStore.find(Thread, message.threadId);
        if (!thread) {
          console.warn(`Cannot find thread ${message.threadId} to process mail rules.`);
          continue;
        }
        await this._applyRuleToMessage(rule, message, thread);
      }
    }
  }

  _checkRuleForMessage(rule, message) {
    const fn =
      rule.conditionMode === ConditionMode.All ? Array.prototype.every : Array.prototype.some;
    if (message.accountId !== rule.accountId) {
      return false;
    }

    return fn.call(rule.conditions, condition => {
      const template = ConditionTemplates.find(t => t.key === condition.templateKey);
      const value = template.valueForMessage(message);
      return template.evaluate(condition, value);
    });
  }

  async _applyRuleToMessage(rule, message, thread) {
    try {
      const actionPromises = rule.actions.map(action => {
        const actionFn = MailRulesActions[action.templateKey];
        if (!actionFn) {
          throw new Error(`${action.templateKey} is not a supported action.`);
        }
        return actionFn(message, thread, action.value);
      });

      const actionResults = await Promise.all(actionPromises);
      const actionTasks = actionResults.filter(r => r instanceof Task);

      // mark that none of these tasks are undoable
      actionTasks.forEach(t => {
        t.canBeUndone = false;
      });

      const performLocalPromises = actionTasks.map(t => TaskQueue.waitForPerformLocal(t));
      Actions.queueTasks(actionTasks);
      await performLocalPromises;
    } catch (err) {
      // Errors can occur if a mail rule specifies an invalid label or folder, etc.
      // Disable the rule. Disable the mail rule so the failure is reflected in the
      // interface.
      Actions.disableMailRule(rule.id, err.toString());
    }
  }
}

module.exports = new MailRulesProcessor();
