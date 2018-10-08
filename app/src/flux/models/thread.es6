const Message = require('./message');
const Contact = require('./contact');
const Folder = require('./folder');
const Label = require('./label');
const Category = require('./category');
const ModelWithMetadata = require('./model-with-metadata');
const DatabaseStore = require('../stores/database-store');


/*
Public: The Thread model represents an email thread.

Attributes

`snippet`: {AttributeString} A short, ~140 character string with the content
  of the last message in the thread. Queryable.

`subject`: {AttributeString} The subject of the thread. Queryable.

`unread`: {AttributeBoolean} True if the thread is unread. Queryable.

`starred`: {AttributeBoolean} True if the thread is starred. Queryable.

`version`: {AttributeNumber} The version number of the thread.

`participants`: {AttributeCollection} A set of {Contact} models
  representing the participants in the thread.
  Note: Contacts on Threads do not have IDs.

`lastMessageReceivedTimestamp`: {AttributeDateTime} The timestamp of the
  last message on the thread.

This class also inherits attributes from {Model}

Section: Models
@class Thread
*/

  class Thread extends ModelWithMetadata {

    static defineAttributes(Attribute) {

      this.sortOrderAttribute = () => {
        return this.attributes.lastMessageReceivedTimestamp;
      };

      this.naturalSortOrder = () => {
        return this.sortOrderAttribute().descending();
      };

      // TODO NONFUNCTIONAL
      Attribute('String', { modelKey: 'snippet', })
      //

      Attribute('String', { modelKey: 'subject',
        queryable: true,
      })
      Attribute('Boolean', { modelKey: 'unread',
        queryable: true,
      })
      Attribute('Boolean', { modelKey: 'starred',
        queryable: true,
      })
      Attribute('Number', { modelKey: 'version',
        queryable: true,
        jsonKey: 'v',
      })
      Attribute('Collection', { modelKey: 'categories',
        queryable: true,
        joinOnField: 'id',
        joinQueryableBy: [
          'inAllMail',
          'lastMessageReceivedTimestamp',
          'lastMessageSentTimestamp',
          'unread',
        ],
        itemClass: Category,
      })
      Attribute('Collection', { modelKey: 'folders',
        itemClass: Folder,
      })
      Attribute('Collection', { modelKey: 'labels',
        joinOnField: 'id',
        joinQueryableBy: [
          'inAllMail',
          'lastMessageReceivedTimestamp',
          'lastMessageSentTimestamp',
          'unread',
        ],
        itemClass: Label,
      })
      Attribute('Collection', { modelKey: 'participants',
        itemClass: Contact,
      })
      Attribute('Number', { modelKey: 'attachmentCount',
      })
      Attribute('DateTime', { modelKey: 'lastMessageReceivedTimestamp',
        queryable: true,
        jsonKey: 'lmrt',
      })
      Attribute('DateTime', { modelKey: 'lastMessageSentTimestamp',
        queryable: true,
        jsonKey: 'lmst',
      })
      Attribute('Boolean', { modelKey: 'inAllMail',
        queryable: true,
      })
    }



    async messages({ includeHidden } = {}) {
      const messages = await DatabaseStore.findAll(Message)
        .where({ threadId: this.id })
        .include(Message.attributes.body);
      if (!includeHidden) {
        return messages.filter(message => !message.isHidden());
      }
      return messages;
    }

    get categories() {
      return [].concat(this.folders || [], this.labels || []);
    }

    set categories(c) {
      // noop
    }

    /**
     * In the `clone` case, there are `categories` set, but no `folders` nor
     * `labels`
     *
     * When loading data from the API, there are `folders` AND `labels` but
     * no `categories` yet.
     */
    fromJSON(json) {
      super.fromJSON(json);

      if (this.participants && this.participants instanceof Array) {
        this.participants.forEach(item => {
          item.accountId = this.accountId;
        });
      }
      return this;
    }

    sortedCategories() {
      if (!this.categories) {
        return [];
      }
      let out = [];
      const isImportant = l => l.role === 'important';
      const isStandardCategory = l => l.isStandardCategory();
      const isUnhiddenStandardLabel = l =>
        !isImportant(l) && isStandardCategory(l) && !l.isHiddenCategory();

      const importantLabel = this.categories.find(isImportant);
      if (importantLabel) {
        out = out.concat(importantLabel);
      }

      const standardLabels = this.categories.filter(isUnhiddenStandardLabel);
      if (standardLabels.length > 0) {
        out = out.concat(standardLabels);
      }

      const userLabels = this.categories.filter(l => !isImportant(l) && !isStandardCategory(l));

      if (userLabels.length > 0) {
        out = out.concat(userLabels.sort((a, b) => a.displayName.localeCompare(b.displayName)));
      }
      return out;
    }
  }
  module.exports = ModelWithMetadata.setup(Thread)
  