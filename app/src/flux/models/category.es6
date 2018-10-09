/* eslint global-require: 0 */
const utf7 = require('utf7');
const Model = require('./model');
const {
  CATS_STANDARD,
  CATS_LOCKED,
  CATS_HIDDEN,
  CAT_NAME_PREFIXES, 
  CAT_NAME_MAP
} = require('mailspring/CONFIG')

// We look for a few standard categories and display them in the Mailboxes
// portion of the left sidebar. Note that these may not all be present on
// a particular account.

const TYPES = {
  Standard: 'standard',
  Locked: 'locked',
  User: 'user',
  Hidden: 'hidden',
}

const StandardRoles = CATS_STANDARD
const LockedRoles = CATS_LOCKED
const HiddenRoles = CATS_HIDDEN

const StandardRoleMap = ToObject(StandardRoles);
const LockedRoleMap = ToObject(LockedRoles);
const HiddenRoleMap = ToObject(HiddenRoles);

const cat_name_prefixes = Object.keys(CAT_NAME_PREFIXES)

function categoryPathToName(str) {

  // TODO:
  for (const prefix of cat_name_prefixes) {
    const offset = CAT_NAME_PREFIXES[prefix]
    if (str.startsWith(prefix) && str.length > prefix.length + offset) {
      str = str.substr(prefix.length + offset); // + delimiter
      break
    }
  }

  const rewrite = CAT_NAME_MAP[str]
  return (rewrite !== undefined)
    ? rewrite
    : str
}

function categoryNameToHue(name) {
  let hue = 0;
  if (!name) { return hue; }
  for (let i = 0; i < name.length; i=i+2) {
    hue = hue + name.charCodeAt(i);
  }
  return hue * 396.0 / 512.0;
}

/**
Private:
This abstract class has only two concrete implementations:
  - `Folder`
  - `Label`

See the equivalent models for details.
Folders and Labels have different semantics. The `Category` class only exists to help DRY code where they happen to behave the same

## Attributes
`role`: {AttributeString} The internal role of the label or folder. Queryable.
`path`: {AttributeString} The IMAP path name of the label or folder. Queryable.

Section: Models
*/

  class Category extends Model {

    static defineAttributes(Attribute) {

      Attribute('String', { modelKey: 'role',
        queryable: true,
      })
      Attribute('String', { modelKey: 'path',
        queryable: true,
      })
      Attribute('Object', { modelKey: 'localStatus', })

      this.StandardRoles = StandardRoles.slice(0)
      this.LockedRoles = LockedRoles.slice(0)
      this.HiddenRoles = HiddenRoles.slice(0)
      this.Types = TYPES;

      this.categoriesSharedRole = function(cats) {
        if (!cats || cats.length === 0) {
          return null;
        }
        const role = cats[0].role;
        if (!cats.every(cat => cat.role === role)) {
          return null;
        }
        return role;
      }
    }

    get displayName() {
      const decoded = utf7.imap.decode(this.path);
      return categoryPathToName(decoded)
    }

    hue() {
      return categoryNameToHue(this.displayName)
    }

    isLockedCategory() {
      return !!LockedRoleMap[this.role] || !!LockedRoleMap[this.path];
    }

    isHiddenCategory() {
      return !!HiddenRoleMap[this.role] || !!HiddenRoleMap[this.path];
    }

    isUserCategory() {
      return !this.isStandardCategory() && !this.isHiddenCategory();
    }

    isArchive() {
      return (
        this.role === 'all' ||
        this.role === 'archive'
      )
      // return ['all', 'archive'].includes(this.role);
    }

    isStandardCategory(forceShowImportant) {
      let showImportant = forceShowImportant;
      if (showImportant === undefined) {
        showImportant = AppEnv.config.get('core.workspace.showImportant');
      }
      if (showImportant === true) {
        return !!StandardRoleMap[this.role];
      }
      return !!StandardRoleMap[this.role] && this.role !== 'important';
    }

    /* IGNORE Available for historical reasons, do not use. */
    get name() { return this.role; }
    displayType() { throw new Error('Base class'); }
  }

  module.exports = Model.setup(Category)

  function ToObject (arr) {
    return arr.reduce((o, v) => {
      o[v] = v;
      return o;
    }, {});
  }