// const env = process.env
// const {PRODUCT_NAME} = require('mailspring/CONFIG')
const CONFIG = (module.exports = {
  PRODUCT_NAME: 'IIII Mail',
  SUPPORT_URL: 'http://support.getmailspring.com/hc/en-us/articles/115001881912',
  SUPPORT_EMAIL: 'support@getmailspring.com',
  UPGRADE_FEATURE_URL: 'https://getmailspring.com/pro',
  CHANGELOG_URL: 'https://github.com/Foundry376/Mailspring/releases/latest',

  QUERY_OFF_THREAD: 0,

  // Note this key name is used when migrating to Nylas Pro accounts from old N1.
  KEYCHAIN_NAME: 'Mailspring Account',
  KEYTAR_KEY_NAME: 'Mailspring Keys',

  /**
Categories
    Implemented by `Folder` & `Label`

Attributes:
    `role`: {AttributeString} The internal role of the label or folder. Queryable.
    `path`: {AttributeString} The IMAP path name of the label or folder. Queryable.

We look for a few standard categories and display them in the Mailboxes
portion of the left sidebar. Note that these may not all be present on
a particular account.

Folders and Labels have different semantics. The `Category` class only exists to help DRY code where they happen to behave the same
*/

  CATS_STANDARD: [
    'inbox',
    'important',
    'snoozed',
    'sent',
    'drafts',
    'all',
    'spam',
    'archive',
    'trash',
  ],
  CATS_LOCKED: ['sent', 'drafts'],
  CATS_HIDDEN: [
    'sent',
    'drafts',
    'all',
    'archive',
    'starred',
    'important',
    'snoozed',
    '[Mailspring]',
  ],
  // name prefixes removed before name remapping
  CAT_NAME_PREFIXES: {
    // displays category name minus prefix & an extra space
    INBOX: 1,
    '[Gmail]': 1,
    '[Mailspring]': 1,
    // displays name minus prefix
    'Mailspring/': 0,
    'Mailspring.': 0,
  },
  CAT_NAME_MAP: {
    INBOX: 'Inbox',
  },
});
