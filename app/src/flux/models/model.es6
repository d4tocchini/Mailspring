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

class Model {
  static create(data) {
    return new this(data);
  }

  static setup(SubClass) {
    SubClass.setupAttributes();
    return SubClass;
  }

  static setupRoot(RootClass) {
    RootClass.setupRootAttributes();
    return RootClass;
  }

  static setupRootAttributes() {
    this.attributes = {};
    this.attributeKeys = [];
    // this.attributesLength = 0
    this._defineAttributes();
  }

  static setupAttributes() {
    const SuperClass = Object.getPrototypeOf(this);
    this.attributeKeys = SuperClass.attributeKeys.slice(0);
    // this.attributesLength = SuperClass.attributesLength
    this.attributes = Object.assign({}, SuperClass.attributes);
    this._defineAttributes();
  }

  static Attribute(Type, spec) {
    const modelKey = spec.modelKey;
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

  constructor(data) {
    if (data) {
      if (data.__cls) {
        this.fromJSON(data);
      } else {
        this.eachAttributeKey((key)=>{
          this[key] = data[key];
        });
      }
    }
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
    const keys = this.attributeKeys();
    var l = keys.length;
    while (l) {
      l = l - 1
      const key = keys[l];
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
    const keys = this.attributeKeys();
    console.log('fromJSON  --' +JSON.stringify(keys))
    let i = keys.length;
    while (i) {
      i = i - 1;
      const key = keys[i];
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
    const json = {};
    const keys = this.attributeKeys();
    let i = keys.length;
    while (i) {
      i = i - 1;
      const key = keys[i];
      const attr = this.constructor.attributes[key];
      const attrValue = this[key];
      if (attrValue === undefined) {
        continue;
      }
      json[attr.jsonKey || key] = attr.toJSON(attrValue);
    }
    Object.defineProperty(
      json, '__cls', {
        enumerable:false,
        configurable:false,
        writable:false,
      }
    )

    // json.__cls = this.constructor.name;
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
    if (criteria instanceof Array) {
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
