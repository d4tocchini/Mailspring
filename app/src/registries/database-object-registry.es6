const SerializableRegistry = require('./serializable-registry');

class DatabaseObjectRegistry extends SerializableRegistry {}

const registry = new DatabaseObjectRegistry();

module.exports = registry;
