const Model = require('./model');

/**
Public: The Calendar model represents a Calendar object.

## Attributes

`name`: {AttributeString} The name of the calendar.

`description`: {AttributeString} The description of the calendar.

This class also inherits attributes from {Model}

Section: Models
*/

class Calendar extends Model {

  static defineAttributes(Attribute) {
    Attribute('String', { modelKey: 'name', jsonKey: 'name', })
    Attribute('String', { modelKey: 'description', jsonKey: 'description', })
    Attribute('Boolean', { modelKey: 'readOnly', jsonKey: 'read_only', })
  }
}

  module.exports = Model.setup(Calendar)