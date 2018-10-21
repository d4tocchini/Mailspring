const { Actions, React, AccountStore, IdentityStore } = require('mailspring-exports');
const { Notification } = require('mailspring-component-kit');


class PleaseSubscribeNotification extends React.Component {
  static displayName = 'PleaseSubscribeNotification';

  constructor() {
    super();
    this.state = this.getStateFromStores();
  }

  componentDidMount() {
    this.unlisteners = [
      AccountStore.listen(() => this.setState(this.getStateFromStores())),
      IdentityStore.listen(() => this.setState(this.getStateFromStores())),
    ];
  }

  componentWillUnmount() {
    for (const u of this.unlisteners) {
      u();
    }
  }

  getStateFromStores() {
    const { stripePlanEffective, stripePlan } = IdentityStore.identity() || {};
    const accountCount = AccountStore.accounts().length;

    let msg = null;
    if (stripePlan === 'Basic' && accountCount > 4) {
      msg = `You're syncing more than four accounts — please consider upgrading to Pro!`;
    }
    if (stripePlan !== stripePlanEffective) {
      msg = `We're having trouble billing your account.`;
    }

    return { msg };
  }

  render() {
    if (!this.state.msg) {
      return <span />;
    }
    return (
      <Notification
        priority="0"
        isDismissable={true}
        title={this.state.msg}
        actions={[
          {
            label: 'Manage',
            fn: () => {
              Actions.switchPreferencesTab('Subscription');
              Actions.openPreferences();
            },
          },
        ]}
      />
    );
  }
}

module.exports = PleaseSubscribeNotification
