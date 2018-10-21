const { React } = require('mailspring-exports');
const { Notification } = require('mailspring-component-kit');
const {PRODUCT_NAME} = require('mailspring/CONFIG')

module.exports = class DevModeNotification extends React.Component {
  static displayName = 'DevModeNotification';

  constructor() {
    super();
    // Don't need listeners to update this, since toggling dev mode reloads
    // the entire window anyway
    this.state = {
      inDevMode: AppEnv.inDevMode(),
    };
  }

  render() {
    if (!this.state.inDevMode) {
      return <span />;
    }
    return (
      <Notification priority="0" title={PRODUCT_NAME + " is running in dev mode and may be slower!"} />
    );
  }
}
