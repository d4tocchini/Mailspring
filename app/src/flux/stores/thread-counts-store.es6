const _ = require('underscore')
const MailspringStore = require('mailspring-store')
const DatabaseStore = require('./database-store')
const Thread = require('../models/thread')

class ThreadCountsStore extends MailspringStore {
  constructor() {
    super();
    this._counts = {};

    if (AppEnv.isMainWindow()) {
      // For now, unread counts are only retrieved in the main window.
      this._onCountsChangedDebounced = _.throttle(this._onCountsChanged, 1000);
      DatabaseStore.listen(change => {
        if (change.objectClass === Thread.name) {
          this._onCountsChangedDebounced();
        }
      });
      this._onCountsChangedDebounced();
    }
  }

  _onCountsChanged = () => {
    DatabaseStore._query('SELECT * FROM `ThreadCounts`').then(results => {
      const nextCounts = {};
      for (const { categoryId, unread, total } of results) {
        nextCounts[categoryId] = { unread, total };
      }
      if (_.isEqual(nextCounts, this._counts)) {
        return;
      }
      this._counts = nextCounts;
      this.trigger();
    });
  };

  unreadCountForCategoryId(catId) {
    if (this._counts[catId] === undefined) {
      return null;
    }
    return this._counts[catId]['unread'];
  }

  totalCountForCategoryId(catId) {
    if (this._counts[catId] === undefined) {
      return null;
    }
    return this._counts[catId]['total'];
  }
}

module.exports = new ThreadCountsStore();
