const Category = require('./category');

class Folder extends Category {
  displayType() {
    return 'folder';
  }
}

module.exports = Folder