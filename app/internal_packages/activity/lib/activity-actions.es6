import Reflux from 'reflux';

const ActivityActions = Reflux.createActions(['markViewed']);

for (const key of Object.keys(ActivityActions)) {
  ActivityActions[key].sync = true;
}

module.exports = ActivityActions;
