const Model = require('./model');

// ProviderSyncbackRequest
  class ProviderSyncbackRequest extends Model {

    static defineAttributes(Attribute) {
      Attribute('String', { modelKey: 'type',
        queryable: true,
      })
      Attribute('Object', { modelKey: 'error', })
      Attribute('Object', { modelKey: 'props', })
      Attribute('Object', { modelKey: 'responseJSON', jsonKey: 'response_json', })
      // The following are "normalized" fields that we can use to consolidate
      // various thirdPartyData source. These list of attributes should
      // always be optional and may change as the needs of a Nylas contact
      // change over time.
      Attribute('String', { modelKey: 'status', })
    }
  }
  module.exports = Model.setup( ProviderSyncbackRequest )
