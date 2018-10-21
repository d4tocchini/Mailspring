const Attributes = require('../attributes');

/**
Public: A base class for API objects that provides abstract support for
serialization and deserialization, matching by attributes, and ID-based equality.

## Attributes

`id`: {AttributeString} The resolved canonical ID of the model used in the
database and generally throughout the app. The id property is a custom
getter that resolves to the id first, and then the id.

`object`: {AttributeString} The model's type. This field is used by the JSON
 deserializer to create an instance of the correct class when inflating the object.

`accountId`: {AttributeString} The string Account Id this model belongs to.

Section: Models
 */

const configuredClasses = new WeakMap()
const NOOP = function() {}

// b
// const setupClasses = new WeakMap()
// const NOOP = function() {}

class Model {

  static create(data) {
    return new this(data);
  }

  static setup(SubClass) {
    // b
    // if (setupClasses.has(SubClass)) return SubClass
    // if (setupClasses.set(SubClass, true))

    SubClass.setupAttributes();
    return SubClass;
  }

  static setupRoot(RootClass) {
    // b
    // if (setupClasses.has(RootClass)) return RootClass
    // setupClasses.set(RootClass, true)

    RootClass.setupRootAttributes()
    return RootClass;
  }

  static setupRootAttributes() {
    configuredClasses.set(this,true)
    this.attributes = {};
    this.attributeKeys = [];
    // this.attributesLength = 0
    this._defineAttributes();
  }

  static setupAttributes() {
    const SuperClass = Object.getPrototypeOf(this);
    if (!configuredClasses.has(SuperClass)) {
      SuperClass.setupAttributes()
    }
    configuredClasses.set(this,true)
    // b
    // SuperClass.setup(SuperClass)
    if (!SuperClass.attributeKeys) {
      // console.log(SuperClass.name + ' !!!!!!!!!!!!')
      throw new Error(SuperClass.name + ' !!!!!!!!!!!!')
    }
    this.attributeKeys = SuperClass.attributeKeys.slice(0);
    this.attributesLength = SuperClass.attributesLength
    if (this.attributes) {
      this.attributeKeys = this.attributeKeys.concat(Object.keys(this.attributes))
    }
    else {
      this.attributes = {}
    }
    // let attrs = this.attributes ? this.attributes : {}
    this.attributes = Object.assign({},this.attributes, SuperClass.attributes);
    this._defineAttributes();
    Object.freeze(this.attributes)
  }

  static Attribute(Type, spec) {
    const modelKey = spec.modelKey;
    this.attributeKeys[this.attributeKeys.length] = modelKey
    // if (this.attributes[modelKey] === undefined) {
    //   this.attributeKeys[this.attributeKeys.length] = modelKey
    // }
    const attr = Attributes[Type](spec);
    // if (!Attributes[Type] || !(attr )) throw new Error('?????')
    this.attributes[modelKey] = attr;
  }

  static _defineAttributes() {
    this.defineAttributes((Type, spec) => {
      return this.Attribute(Type, spec);
    });
  }

  static defineAttributes(Attribute) {
    Attribute('String', {
      modelKey: 'id',
      queryable: true,
    });
    Attribute('String', {
      modelKey: 'accountId',
      jsonKey: 'aid',
      queryable: true,
    });
  }

  static naturalSortOrder = () => null;

  // b
  // _ensure_did_setup_attributes() {
  //   this._ensure_did_setup_attributes = NOOP
  //   this.constructor.setup(this.constructor)
  // }
  _ensure_did_configure() {
    if (!configuredClasses.has(this.constructor)) {
      // console.log(this.constructor.name + ' did not config attributes')
      this.constructor.setupAttributes()
      // throw new Error(this.constructor.name+': Model did not configure attributes')
    }
    this.constructor.prototype._ensure_did_configure = NOOP
  }
  constructor(data) {
    this._ensure_did_configure()
    // b
    // this._ensure_did_setup_attributes()

    if (data) {
      if (data.__cls) {
        this.fromJSON(data);
      } else {
        this.eachAttributeKey((key)=>{
          const val = data[key]
          if (val !== undefined)
            this[key] = val
        });
      }
    }
    // this.__cls = this.constructor.name
  }

  // _init_data(key) {
  //   const data = this.__data__;
  //   // console.log('  __init_data____ ' + key)
  //   if (data[key] !== undefined) {
  //     this[key] = data[key];
  //   }
  // }

  getStatic(key) {
    return this.constructor[key];
  }

  eachAttributeKey(fn) {
    var i = 0
    const keys = this.attributeKeys();
    const l = keys.length;
    while (i < l) {
      const key = keys[i];
      i = i + 1
      // if (
      fn(key);
      // ) break
    }
  }

  attributesList() {
    return this.constructor.attributes;
  }

  attributesLength() {
    throw new Error('attributesLength');
    return this.constructor.attributesLength;
  }

  attributeKeys() {
    return Object.keys(this.attributesList());
    // return this.constructor.attributeKeys
  }

  attributeValue(key) {
    return this.constructor.attributes[key];
  }

  clone() {
    return this.constructor.create(this.toJSON());
  }

  // Public: Inflates the model object from JSON, using the defined attributes to
  // guide type coercision.
  //
  // - `json` A plain Javascript {Object} with the JSON representation of the model.
  //
  // This method is chainable.
  fromJSON(json) {
    var i = 0
    const keys = this.attributeKeys();
    const l = keys.length;
    // if (json.__cls) {
    //   this['__cls'] = json.__cls
    // }
    while (i < l) {
      const key = keys[i];
      i = i + 1;
      const attr = this.constructor.attributes[key];
      const attrValue = json[attr.jsonKey || key];
      if (attrValue !== undefined) {
        this[key] = attr.fromJSON(attrValue);
        // D4
        // if (this[key] === undefined) throw new Error('xxx')
      }
    }
    return this;
  }

  // Public: Deflates the model to a plain JSON object. Only attributes defined
  // on the model are included in the JSON.
  //
  // Returns an {Object} with the JSON representation of the model.
  //
  toJSON() {
    var i = 0
    const json = {};
    const keys = this.attributeKeys();
    const l = keys.length;
    while (i < l) {
      const key = keys[i];
      i = i + 1;
      if (this[key] === undefined) {
        continue;
      }
      const attr = this.constructor.attributes[key];
      const attrValue = attr.toJSON(this[key]);
      const jsonKey = attr.jsonKey !== undefined
        ? attr.jsonKey
        : key
      json[jsonKey] = attrValue;
    }
    // Object.defineProperty(
    //   json, '__cls', {
    //     enumerable:false,
    //     configurable:false,
    //     writable:false,
    //     value:this.constructor.name
    //   }
    // )
    json.__cls = this.constructor.name;
    return json;
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  // Public: Evaluates the model against one or more {Matcher} objects.
  //
  // - `criteria` An {Array} of {Matcher}s to run on the model.
  //
  // Returns true if the model matches the criteria.
  //
  matches(criteria) {
    if (!(criteria instanceof Array)) {
      console.warn('Model:matches(criteria) criteria must be type Array ')
      return false;
    }
    for (const matcher of criteria) {
      if (!matcher.evaluate(this)) {
        return false;
      }
    }
    return true;
  }
}

Model.setupRoot(Model);
module.exports = Model;
