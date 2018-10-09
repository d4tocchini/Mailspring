

// const env = process.env

const CONFIG =
module.exports = {
    // Note this key name is used when migrating to Nylas Pro accounts from old N1.
    KEYCHAIN_NAME: 'Mailspring Account',

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
    CATS_LOCKED: [
        'sent',
        'drafts'
    ],
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
        'INBOX': 1,
        '[Gmail]': 1,
        '[Mailspring]': 1,
        // displays name minus prefix
        'Mailspring/': 0,
        'Mailspring.': 0,
    },
    CAT_NAME_MAP: {
        'INBOX': 'Inbox'
    }
}






