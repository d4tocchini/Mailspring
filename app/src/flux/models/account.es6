/* eslint global-require:0 */

const ModelWithMetadata = require('./model-with-metadata');
let CategoryStore = null;
let Contact = null;

/*
 * Public: The Account model represents a Account served by the Nylas Platform API.
 * Every object on the Nylas platform exists within a Account, which typically represents
 * an email account.
 *
 * ## Attributes
 *
 * `name`: {AttributeString} The name of the Account.
 *
 * `provider`: {AttributeString} The Account's mail provider  (ie: `gmail`)
 *
 * `emailAddress`: {AttributeString} The Account's email address
 * (ie: `ben@nylas.com`). Queryable.
 *
 * This class also inherits attributes from {Model}
 *
 * Section: Models
 */


const Account = module.exports = ModelWithMetadata.setup(

  class extends ModelWithMetadata {

    static defineAttributes(Attribute) {

      this.SYNC_STATE_OK = 'ok';
      this.SYNC_STATE_AUTH_FAILED = 'invalid';
      this.SYNC_STATE_ERROR = 'sync_error';

      Attribute('String', { modelKey: 'name', })
      Attribute('String', { modelKey: 'provider', })
      Attribute('String', { modelKey: 'emailAddress',
        queryable: true,
      })
      Attribute('Object', { modelKey: 'settings', })
      Attribute('String', { modelKey: 'label', })
      Attribute('Object', { modelKey: 'autoaddress', })
      Attribute('Object', { modelKey: 'aliases', })
      Attribute('Object', { modelKey: 'defaultAlias', })
      Attribute('String', { modelKey: 'syncState', })
      Attribute('Object', { modelKey: 'syncError', })
    }

    constructor(args) {
      super(args);
      this.aliases = this.aliases || [];
      this.label = this.label || this.emailAddress;
      // if (!this.getStatic('SYNC_STATE_OK') === undefined) throw new Error('!!!')
      this.syncState = this.syncState || this.getStatic('SYNC_STATE_OK')
      this.autoaddress = this.autoaddress || {
        type: 'bcc',
        value: '',
      };
    }

    toJSON(...args) {
      // ensure we deep-copy our settings object into the JSON
      const json = super.toJSON(...args);
      json.settings = Object.assign({}, json.settings);
      return json;
    }

    fromJSON(json) {
      super.fromJSON(json);
      if (!this.label) {
        this.label = this.emailAddress;
      }
      return this;
    }

    // Returns a {Contact} model that represents the current user.
    me() {
      Contact = Contact || require('./contact');

      return new Contact({
        // used to give them random strings, let's try for something consistent
        id: `local-${this.id}-me`,
        accountId: this.id,
        name: this.name,
        email: this.emailAddress,
      });
    }

    meUsingAlias(alias) {
      Contact = Contact || require('./contact');

      if (!alias) {
        return this.me();
      }
      return Contact.fromString(alias, {
        accountId: this.id,
      });
    }

    defaultMe() {
      if (this.defaultAlias) {
        return this.meUsingAlias(this.defaultAlias);
      }
      return this.me();
    }

    usesLabels() {
      return this.provider === 'gmail';
    }

    // Public: Returns the localized, properly capitalized provider name,
    // like Gmail, Exchange, or Outlook 365
    displayProvider() {
      if (this.provider === 'eas') {
        return 'Exchange';
      } else if (this.provider === 'gmail') {
        return 'Gmail';
      } else if (this.provider === 'yahoo') {
        return 'Yahoo';
      } else if (this.provider === 'imap') {
        return 'IMAP';
      } else if (this.provider === 'office365') {
        return 'Office 365';
      }
      return this.provider;
    }

    canArchiveThreads() {
      CategoryStore = CategoryStore || require('../stores/category-store');
      return CategoryStore.getArchiveCategory(this);
    }

    canTrashThreads() {
      CategoryStore = CategoryStore || require('../stores/category-store');
      return CategoryStore.getTrashCategory(this);
    }

    preferredRemovalDestination() {
      CategoryStore = CategoryStore || require('../stores/category-store');
      const preferDelete = AppEnv.config.get('core.reading.backspaceDelete');
      if (preferDelete || !CategoryStore.getArchiveCategory(this)) {
        return CategoryStore.getTrashCategory(this);
      }
      return CategoryStore.getArchiveCategory(this);
    }

    hasSyncStateError() {
      return this.syncState !== this.getStatic('SYNC_STATE_OK');
    }
  }
)