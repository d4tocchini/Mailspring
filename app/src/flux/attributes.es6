const Matcher = require('./attributes/matcher');
const SortOrder = require('./attributes/sort-order');
const AttributeNumber = require('./attributes/attribute-number');
const AttributeString = require('./attributes/attribute-string');
const AttributeObject = require('./attributes/attribute-object');
const AttributeBoolean = require('./attributes/attribute-boolean');
const AttributeDateTime = require('./attributes/attribute-datetime');
const AttributeCollection = require('./attributes/attribute-collection');
const AttributeJoinedData = require('./attributes/attribute-joined-data');

module.exports = {
  Matcher: Matcher,
  SortOrder: SortOrder,

  Number: (...args) => new AttributeNumber(...args),
  String: (...args) => new AttributeString(...args),
  Object: (...args) => new AttributeObject(...args),
  Boolean: (...args) => new AttributeBoolean(...args),
  DateTime: (...args) => new AttributeDateTime(...args),
  Collection: (...args) => new AttributeCollection(...args),
  JoinedData: (...args) => new AttributeJoinedData(...args),

  AttributeNumber: AttributeNumber,
  AttributeString: AttributeString,
  AttributeObject: AttributeObject,
  AttributeBoolean: AttributeBoolean,
  AttributeDateTime: AttributeDateTime,
  AttributeCollection: AttributeCollection,
  AttributeJoinedData: AttributeJoinedData,
};
