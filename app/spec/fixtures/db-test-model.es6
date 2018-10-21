/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Model = require('../../src/flux/models/model');
const Category = require('../../src/flux/models/category');
const Attributes = require('../../src/flux/attributes');

class TestModel extends Model {
  static defineAttributes(Attribute) {
    Attribute('String', {
      queryable: true,
      modelKey: 'id',
    })

    Attribute('String', {
      queryable: true,
      modelKey: 'clientId',
      jsonKey: 'client_id',
    })

    Attribute('String', {
      queryable: true,
      modelKey: 'serverId',
      jsonKey: 'server_id',
    })
  }
}
Model.setup(TestModel)


// TestModel.configureBasic = () =>
//   (TestModel.attributes = {
//     id: Attributes.String({
//       queryable: true,
//       modelKey: 'id',
//     }),
//     clientId: Attributes.String({
//       queryable: true,
//       modelKey: 'clientId',
//       jsonKey: 'client_id',
//     }),
//     serverId: Attributes.String({
//       queryable: true,
//       modelKey: 'serverId',
//       jsonKey: 'server_id',
//     }),
//   });
TestModel.configureBasic = () => {
  return TestModel
}


// TestModel.configureWithAllAttributes = () =>
//   (TestModel.attributes = {
//     datetime: Attributes.DateTime({
//       queryable: true,
//       modelKey: 'datetime',
//     }),
//     string: Attributes.String({
//       queryable: true,
//       modelKey: 'string',
//       jsonKey: 'string-json-key',
//     }),
//     boolean: Attributes.Boolean({
//       queryable: true,
//       modelKey: 'boolean',
//     }),
//     number: Attributes.Number({
//       queryable: true,
//       modelKey: 'number',
//     }),
//     other: Attributes.String({
//       modelKey: 'other',
//     }),
//   });
TestModel.configureWithAllAttributes = () => {
  class TestModel extends Model {
    static defineAttributes(Attribute) {
      Attribute('DateTime', {
        queryable: true,
        modelKey: 'datetime',
      })
      Attribute('String', {
        queryable: true,
        modelKey: 'string',
        jsonKey: 'string-json-key',
      })
      Attribute('Boolean', {
        queryable: true,
        modelKey: 'boolean',
      })
      Attribute('Number', {
        queryable: true,
        modelKey: 'number',
      }),
      Attribute('String', {
        modelKey: 'other',
      })
    }
  }
  Model.setup(TestModel)
  return TestModel
}



TestModel.configureWithCollectionAttribute = () =>
  (TestModel.attributes = {
    id: Attributes.String({
      queryable: true,
      modelKey: 'id',
    }),
    clientId: Attributes.String({
      queryable: true,
      modelKey: 'clientId',
      jsonKey: 'client_id',
    }),
    serverId: Attributes.String({
      queryable: true,
      modelKey: 'serverId',
      jsonKey: 'server_id',
    }),
    other: Attributes.String({
      queryable: true,
      modelKey: 'other',
    }),
    categories: Attributes.Collection({
      queryable: true,
      modelKey: 'categories',
      itemClass: Category,
      joinOnField: 'id',
      joinQueryableBy: ['other'],
    }),
  });

TestModel.configureWithJoinedDataAttribute = function() {
  TestModel.attributes = {
    id: Attributes.String({
      queryable: true,
      modelKey: 'id',
    }),
    clientId: Attributes.String({
      queryable: true,
      modelKey: 'clientId',
      jsonKey: 'client_id',
    }),
    serverId: Attributes.String({
      queryable: true,
      modelKey: 'serverId',
      jsonKey: 'server_id',
    }),
    body: Attributes.JoinedData({
      modelTable: 'TestModelBody',
      modelKey: 'body',
    }),
  };

  TestModel.attributes = {
    id: Attributes.String({
      queryable: true,
      modelKey: 'id',
    }),
    clientId: Attributes.String({
      modelKey: 'clientId',
      jsonKey: 'client_id',
    }),
    serverId: Attributes.String({
      modelKey: 'serverId',
      jsonKey: 'server_id',
    }),
    body: Attributes.JoinedData({
      modelTable: 'TestModelBody',
      modelKey: 'body',
    }),
  };
};

module.exports = TestModel;
