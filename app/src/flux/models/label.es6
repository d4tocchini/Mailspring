const Category = require('./category');

class Label extends Category {
  displayType() {
    return 'label';
  }
}

module.exports = Label