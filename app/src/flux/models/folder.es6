const Category = require('./category');

class Folder extends Category {
  displayType() {
    return 'folder';
  }
}
Folder.setupAttributes()
module.exports = Folder