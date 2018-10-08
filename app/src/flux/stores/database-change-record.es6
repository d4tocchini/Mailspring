/*
DatabaseChangeRecord is the object emitted from the DatabaseStore when it triggers.
The DatabaseChangeRecord contains information about what type of model changed,
and references to the new model values. All mutations to the database produce these
change records.
*/
module.exports = class DatabaseChangeRecord {
  constructor(opts) {
    const { type, objectClass, objects } = opts
    this.objects = objects;
    this.type = type;
    this.objectClass = objectClass;
  }

  toJSON() {
    return {
      type: this.type,
      objectClass: this.objectClass,
      objectsString: this._objectsString,
    };
  }
}
