const fs = require('fs');
const Utils = require('./flux/models/utils');

export function atomicWriteFileSync(filepath, content) {
  const randomId = Utils.generateTempId();
  const backupPath = `${filepath}.${randomId}.bak`;
  fs.writeFileSync(backupPath, content);
  fs.renameSync(backupPath, filepath);
}
