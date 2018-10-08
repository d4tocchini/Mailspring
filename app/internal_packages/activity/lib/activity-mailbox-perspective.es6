import { WorkspaceStore, MailboxPerspective } from 'mailspring-exports';

module.exports = class ActivityMailboxPerspective extends MailboxPerspective {
  sheet() {
    return WorkspaceStore.Sheet.Activity;
  }
  threads() {
    return null;
  }
  canReceiveThreadsFromAccountIds() {
    return false;
  }
  unreadCount() {
    return 0;
  }
}
