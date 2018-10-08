/* eslint global-require: 0 */
const _str = require('underscore.string');
const Model = require('./model');
const Utils = require('./utils');
const RegExpUtils = require ('../../regexp-utils');
const AccountStore = require('../stores/account-store');

let FocusedPerspectiveStore = null; // Circular Dependency

/*
Public: The Contact model represents a Contact object.

Attributes

`name`: {AttributeString} The name of the contact. Queryable.

`email`: {AttributeString} The email address of the contact. Queryable.

`thirdPartyData`: {AttributeObject} Extra data that we find out about a
contact.  The data is keyed by the 3rd party service that dumped the data
there. The value is an object of raw data in the form that the service
provides

We also have "normalized" optional data for each contact. This list may
grow as the needs of a contact become more complex.

This class also inherits attributes from {Model}

Section: Models
*/


  class Contact extends Model {

    static defineAttributes(Attribute) {

      this.searchable = true;
      this.searchFields = ['content'];
      this.sortOrderAttribute = () => {
        return this.attributes.id;
      };
      this.naturalSortOrder = () => {
        return this.sortOrderAttribute().descending();
      };

      Attribute('String', { modelKey: 'name', })
      Attribute('String', { modelKey: 'email',
        queryable: true,
      })
      Attribute('Number', { modelKey: 'refs',
        queryable: true,
      })
      // Contains the raw thirdPartyData (keyed by the vendor name) about
      // this contact.
      Attribute('Object', { modelKey: 'thirdPartyData', })
      // The following are "normalized" fields that we can use to consolidate
      // various thirdPartyData source. These list of attributes should
      // always be optional and may change as the needs of a Nylas contact
      // change over time.
      Attribute('String', { modelKey: 'title', })
      Attribute('String', { modelKey: 'phone', })
      Attribute('String', { modelKey: 'company', })
      // This corresponds to the rowid in the FTS table. We need to use the FTS
      // rowid when updating and deleting items in the FTS table because otherwise
      // these operations would be way too slow on large FTS tables.
      Attribute('Number', { modelKey: 'searchIndexId', })
    }

    static fromString(string, { accountId } = {}) {
      const emailRegex = RegExpUtils.emailRegex();
      const match = emailRegex.exec(string);
      if (emailRegex.exec(string)) {
        throw new Error(
          'Error while calling Contact.fromString: string contains more than one email'
        );
      }
      const email = match[0];
      let name = string.substr(0, match.index - 1);
      if (name.endsWith('<') || name.endsWith('(')) {
        name = name.substr(0, name.length - 1);
      }
      return this.create({
        // used to give them random strings, let's try for something consistent
        id: `local-${accountId}-${email}`,
        accountId: accountId,
        name: name.trim(),
        email: email,
      });
    }

    constructor(data) {
      super(data);
      this.thirdPartyData = this.thirdPartyData || {};
    }

    // Public: Returns a string of the format `Full Name <email@address.com>` if
    // the contact has a populated name, just the email address otherwise.
    toString() {
      // Note: This is used as the drag-drop text of a Contact token, in the
      // creation of message bylines "From Ben Gotow <ben@nylas>", and several other
      // places. Change with care.
      return this.name && this.name !== this.email ? `${this.name} <${this.email}>` : this.email;
    }

    fromJSON(json) {
      super.fromJSON(json);
      this.name = this.name || this.email;
      return json;
    }

    // Public: Returns true if the contact provided is a {Contact} instance and
    // contains a properly formatted email address.
    isValid() {
      if (!this.email) {
        return false;
      }

      // The email regexp must match the /entire/ email address
      const result = RegExpUtils.emailRegex().exec(this.email);
      return result && result instanceof Array ? result[0] === this.email : false;
    }

    // Public: Returns true if the contact is the current user, false otherwise.
    // You should use this method instead of comparing the user's email address to
    // the account email, since it is case-insensitive and future-proof.
    isMe() {
      return !!AccountStore.accountForEmail(this.email);
    }

    hasSameDomainAsMe() {
      for (const myEmail of AccountStore.emailAddresses()) {
        if (Utils.emailsHaveSameDomain(this.email, myEmail)) {
          return true;
        }
      }
      return false;
    }

    isMePhrase({ includeAccountLabel, forceAccountLabel } = {}) {
      const account = AccountStore.accountForEmail(this.email);
      if (!account) {
        return null;
      }

      if (includeAccountLabel) {
        FocusedPerspectiveStore =
          FocusedPerspectiveStore || require('../stores/focused-perspective-store');
        if (
          account &&
          (FocusedPerspectiveStore.current().accountIds.length > 1 || forceAccountLabel)
        ) {
          return `You (${account.label})`;
        }
      }
      return 'You';
    }

    // Returns a {String} display name.
    // - "You" if the contact is the current user or an alias for the current user.
    // - `name` if the contact has a populated name
    // - `email` in all other cases.

    // You can pass several options to customize the name:
    // - includeAccountLabel: If the contact represents the current user, include
    //   the account label afer "You"
    // - forceAccountLabel: Always include the account label
    // - compact: If the contact has a name, make the name as short as possible
    //   (generally returns just the first name.)
    displayName(options = {}) {
      let includeAccountLabel = options.includeAccountLabel;
      const forceAccountLabel = options.forceAccountLabel;
      const compact = options.compact || false;

      if (includeAccountLabel === undefined) {
        includeAccountLabel = !compact;
      }

      const fallback = compact ? this.firstName() : this.fullName();
      return this.isMePhrase({ forceAccountLabel, includeAccountLabel }) || fallback;
    }

    fullName() {
      return this._nameParts().join(' ');
    }

    firstName() {
      const exclusions = ['a', 'the', 'dr.', 'mrs.', 'mr.', 'mx.', 'prof.', 'ph.d.'];
      return this._nameParts().find(p => !exclusions.includes(p.toLowerCase())) || '';
    }

    lastName() {
      return (
        this._nameParts()
          .slice(1)
          .join(' ') || ''
      );
    }

    nameAbbreviation() {
      const c1 = (this.firstName()[0] || '').toUpperCase();
      const c2 = (this.lastName()[0] || '').toUpperCase();
      if (c2 === '(' || c2 === '[') {
        return c1; // eg: "Susana (Airbnb)"
      }
      return c1 + c2;
    }

    guessCompanyFromEmail(email = this.email) {
      if (Utils.emailHasCommonDomain(email)) {
        return '';
      }
      const domain = email
        .toLowerCase()
        .trim()
        .split('@')
        .pop();
      const domainParts = domain.split('.');
      if (domainParts.length >= 2) {
        return _str.titleize(_str.humanize(domainParts[domainParts.length - 2]));
      }
      return '';
    }

    _nameParts() {
      let name = this.name;

      // At this point, if the name is empty we'll use the email address
      if (!name || name.length === 0) {
        name = this.email || '';

        // If the phrase has an '@', use everything before the @ sign
        // Unless there that would result in an empty string.
        if (name.indexOf('@') > 0) {
          name = name.split('@').shift();
        }
      }

      // Take care of phrases like "Mike Kaylor via LinkedIn" that should be displayed
      // as the contents before the separator word. Do not break "Olivia"
      name = name.split(/(\svia\s)/i).shift();

      // Take care of whitespace
      name = name.trim();

      // Handle last name, first name
      let parts = this._parseReverseNames(name);

      // Split the name into words and remove parts that are prefixes and suffixes
      if (parts.join('').length === 0) {
        parts = [];
        parts = name.split(/\s+/);
        if (parts.length > 0 && namePrefixes[parts[0].toLowerCase().replace(/\./, '')]) {
          parts = parts.slice(1);
        }
        if (
          parts.length > 0 &&
          nameSuffixes[parts[parts.length - 1].toLowerCase().replace(/\./, '')]
        ) {
          parts = parts.slice(0, parts.length - 1);
        }
      }

      // If we've removed all the parts, just return the whole name
      if (parts.join('').length === 0) {
        parts = [name];
      }

      // If all that failed, fall back to email
      if (parts.join('').length === 0) {
        parts = [this.email];
      }

      return parts;
    }

    _parseReverseNames(name) {
      const parts = [];
      const [lastName, remainder] = name.split(', ');
      if (remainder) {
        const [firstName, description] = remainder.split('(');

        parts.push(firstName.trim());
        parts.push(lastName.trim());
        if (description) {
          parts.push(`(${description.trim()}`);
        }
      }
      return parts;
    }
  }


const namePrefixes = {
  '2dlt': true,
  '2lt': true,
  '2nd lieutenant': true,
  'adm': true,
  'administrative': true,
  'admiral': true,
  'amb': true,
  'ambassador': true,
  'attorney': true,
  'atty': true,
  'baron': true,
  'baroness': true,
  'bishop': true,
  'br': true,
  'brig gen or bg': true,
  'brigadier general': true,
  'brnss': true,
  'brother': true,
  'capt': true,
  'captain': true,
  'chancellor': true,
  'chaplain': true,
  'chapln': true,
  'chief petty officer': true,
  'cmdr': true,
  'cntss': true,
  'coach': true,
  'col': true,
  'colonel': true,
  'commander': true,
  'corporal': true,
  'count': true,
  'countess': true,
  'cpl': true,
  'cpo': true,
  'cpt': true,
  'doctor': true,
  'dr': true,
  'dr and mrs': true,
  'drs': true,
  'duke': true,
  'ens': true,
  'ensign': true,
  'estate of': true,
  'father': true,
  'father': true,
  'fr': true,
  'frau': true,
  'friar': true,
  'gen': true,
  'general': true,
  'gov': true,
  'governor': true,
  'hon': true,
  'honorable': true,
  'judge': true,
  'justice': true,
  'lieutenant': true,
  'lieutenant colonel': true,
  'lieutenant commander': true,
  'lieutenant general': true,
  'lieutenant junior grade': true,
  'lord': true,
  'lt': true,
  'ltc': true,
  'lt cmdr': true,
  'lt col': true,
  'lt gen': true,
  'ltg': true,
  'lt jg': true,
  'm': true,
  'madame': true,
  'mademoiselle': true,
  'maj': true,
  'maj': true,
  'master sergeant': true,
  'master sgt': true,
  'miss': true,
  'miss': true,
  'mlle': true,
  'mme': true,
  'monsieur': true,
  'monsignor': true,
  'monsignor': true,
  'mr': true,
  'mr': true,
  'mr & dr': true,
  'mr and dr': true,
  'mr & mrs': true,
  'mr and mrs': true,
  'mrs & mr': true,
  'mrs and mr': true,
  'ms': true,
  'ms': true,
  'msgr': true,
  'msgr': true,
  'ofc': true,
  'officer': true,
  'president': true,
  'princess': true,
  'private': true,
  'prof': true,
  'prof & mrs': true,
  'professor': true,
  'pvt': true,
  'rabbi': true,
  'radm': true,
  'rear admiral': true,
  'rep': true,
  'representative': true,
  'rev': true,
  'reverend': true,
  'reverends': true,
  'revs': true,
  'right reverend': true,
  'rtrev': true,
  's sgt': true,
  'sargent': true,
  'sec': true,
  'secretary': true,
  'sen': true,
  'senator': true,
  'senor': true,
  'senora': true,
  'senorita': true,
  'sergeant': true,
  'sgt': true,
  'sgt': true,
  'sheikh': true,
  'sir': true,
  'sister': true,
  'sister': true,
  'sr': true,
  'sra': true,
  'srta': true,
  'staff sergeant': true,
  'superintendent': true,
  'supt': true,
  'the hon': true,
  'the honorable': true,
  'the venerable': true,
  'treas': true,
  'treasurer': true,
  'trust': true,
  'trustees of': true,
  'vadm': true,
  'vice admiral': true,
}
// ].forEach(prefix => {
//   namePrefixes[prefix] = true;
// });

const nameSuffixes = {
  '1': true,
  '2': true,
  '3': true,
  '4': true,
  '5': true,
  '6': true,
  '7': true,
  'i': true,
  'ii': true,
  'iii': true,
  'iv': true,
  'v': true,
  'vi': true,
  'vii': true,
  'viii': true,
  'ix': true,
  '1st': true,
  '2nd': true,
  '3rd': true,
  '4th': true,
  '5th': true,
  '6th': true,
  '7th': true,
  'cfx': true,
  'cnd': true,
  'cpa': true,
  'csb': true,
  'csc': true,
  'csfn': true,
  'csj': true,
  'dc': true,
  'dds': true,
  'esq': true,
  'esquire': true,
  'first': true,
  'fs': true,
  'fsc': true,
  'ihm': true,
  'jd': true,
  'jr': true,
  'md': true,
  'ocd': true,
  'ofm': true,
  'op': true,
  'osa': true,
  'osb': true,
  'osf': true,
  'phd': true,
  'pm': true,
  'rdc': true,
  'ret': true,
  'rsm': true,
  'second': true,
  'sj': true,
  'sm': true,
  'snd': true,
  'sp': true,
  'sr': true,
  'ssj': true,
  'us army': true,
  'us army ret': true,
  'usa': true,
  'usa ret': true,
  'usaf': true,
  'usaf ret': true,
  'usaf us air force': true,
  'usmc us marine corp': true,
  'usmcr us marine reserves': true,
  'usn': true,
  'usn ret': true,
  'usn us navy': true,
  'vm': true,
};

module.exports = Model.setup(Contact)