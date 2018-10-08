
const Task = require('./task');
const AccountStore = require('../stores/account-store');

  class SendFeatureUsageEventTask extends Task {

    static defineAttributes(Attribute) {
      Attribute('String', { modelKey: 'feature', })
    }

    constructor(data) {
      super(data);
      // Tasks must have an accountId so they can be assigned to a sync worker.
      // We don't really care what sync worker handles this, since it's just a
      // POST to id.getmailspring.com. Just assign the first account ID.
      if (!this.accountId) {
        this.accountId = AccountStore.accountIds()[0];
      }
    }
  }
  module.exports = Task.setup(SendFeatureUsageEventTask)
