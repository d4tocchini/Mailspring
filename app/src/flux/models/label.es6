const Category = require('./category');

class Label extends Category {
  displayType() {
    return 'label';
  }
}
Label.setupAttributes()
module.exports = Label