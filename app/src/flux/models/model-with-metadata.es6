const Model = require('./model');

/**
 Cloud-persisted data that is associated with a single Nylas API object
 (like a `Thread`, `Message`, or `Account`).
 */

 // D4 ?...
class PluginMetadata extends Model {

    static defineAttributes(Attribute) {
      Attribute('String', { modelKey: 'pluginId', })
      Attribute('Number', { modelKey: 'version', jsonKey: 'v', })
      Attribute('Object', { modelKey: 'value', })
    }

    constructor(data) {
      super(data);
      this.version = this.version|0;
    }

    get id() {
      return this.pluginId;
    }

    set id(pluginId) {
      this.pluginId = pluginId;
    }
  }
  Model.setupRoot(PluginMetadata)

/**
 Plugins can attach arbitrary JSON data to any model that subclasses
 ModelWithMetadata, like {{Thread}} or {{Message}}. You must get and set
 metadata using your plugin's ID, and any metadata you set overwrites the
 metadata previously on the object for the given plugin id.

 Reading the metadata of other plugins is discouraged and may become impossible
 in the future.
*/


  class ModelWithMetadata extends Model {

    static defineAttributes(Attribute) {

      // this.PluginMetadata = PluginMetadata
      this.naturalSortOrder = function () { return null; }

      Attribute('Collection', { modelKey: 'pluginMetadata',
        queryable: true,
        itemClass: PluginMetadata,
        joinOnField: 'pluginId',
        joinTableName: 'ModelPluginMetadata',
        jsonKey: 'metadata',
      })
    }

    constructor(data) {
      super(data);
      this.pluginMetadata = this.pluginMetadata || [];      
    }

    // Public accessors

    // metadataForPluginId(pluginId) {
    //   const metadata = this.metadataObjectForPluginId(pluginId);
    //                 // D4
    //   if (!metadata || !metadata.value) {
    //     return null;
    //   }
    //   const value = JSON.parse(JSON.stringify(metadata.value));
    //   if (value.expiration) {
    //     value.expiration = new Date(value.expiration * 1000);
    //   }
    //   // if (Object.keys(value).length === 0) {
    //   //   return null;
    //   // }
    //   return value;
    // }
    metadataForPluginId(pluginId) {
      const metadata = this.metadataObjectForPluginId(pluginId);
      if (!metadata) {
        return null;
      }
      const value = JSON.parse(JSON.stringify(metadata.value));
      if (value.expiration) {
        value.expiration = new Date(value.expiration * 1000);
      }
      if (Object.keys(value).length === 0) {
        return null;
      }
      return value;
    }

    /**
     * Normally metadata is modified by queueing a SyncbackMetadataTask. We want changes to
     * metadata to be undoable just like other draft changes in the composer. To enable this,
     * we change the draft's metadata directly with other attributes and then use SyncbackDraftTask
     * to commit all the changes at once. It's a bit messy: this code must match the C++ codebase.
     */
    directlyAttachMetadata(pluginId, metadataValue) {
      // ensure that this function treats metadata objects as immutable
      this.pluginMetadata = (this.pluginMetadata.map(p => p.clone())).slice(0);

      let metadata = this.metadataObjectForPluginId(pluginId);
      if (!metadata) {
        metadata = new PluginMetadata({ pluginId, version: 0 });
        this.pluginMetadata.push(metadata);
      }
      metadata.value = Object.assign({}, metadataValue);
      metadata.version += 1;
      if (metadata.value.expiration) {
        metadata.value.expiration = Math.round(new Date(metadata.value.expiration).getTime() / 1000);
      }
      return this;
    }

    // Private helpers

    metadataObjectForPluginId(pluginId) {
      if (typeof pluginId !== 'string') {
        throw new Error(`Invalid pluginId. Must be a valid string: '${pluginId}'`, pluginId);
      }
      return this.pluginMetadata.find(metadata => metadata.pluginId === pluginId);
    }
  }

  module.exports = Model.setup(ModelWithMetadata)

