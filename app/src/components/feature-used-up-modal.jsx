const React = require('react');
const PropTypes = require('prop-types');
const { shell } = require('electron');
const Actions = require('../flux/actions');
const RetinaImg = require('./retina-img');
const BillingModal = require('./billing-modal');
const IdentityStore = require('../flux/stores/identity-store');

const {UPGRADE_FEATURE_URL} = require('mailspring/CONFIG')

class FeatureUsedUpModal extends React.Component {
  static propTypes = {
    modalClass: PropTypes.string.isRequired,
    headerText: PropTypes.string.isRequired,
    rechargeText: PropTypes.string.isRequired,
    iconUrl: PropTypes.string.isRequired,
  };

  componentDidMount() {
    this._mounted = true;

    // $
    IdentityStore.fetchSingleSignOnURL('/payment?embedded=true').then(upgradeUrl => {
      if (!this._mounted) {
        return;
      }
      this.setState({ upgradeUrl });
    });
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  onGoToFeatures = () => {
    shell.openExternal(UPGRADE_FEATURE_URL);
  };

  onUpgrade = e => {
    e.stopPropagation();
    Actions.openModal({
      component: <BillingModal source="feature-limit" upgradeUrl={this.state.upgradeUrl} />,
      width: BillingModal.IntrinsicWidth,
      height: BillingModal.IntrinsicHeight,
    });
  };

  render() {
    return (
      <div className={`feature-usage-modal ${this.props.modalClass}`}>
        <div className="feature-header">
          <div className="icon">
            <RetinaImg
              url={this.props.iconUrl}
              style={{ position: 'relative', top: '-2px' }}
              mode={RetinaImg.Mode.ContentPreserve}
            />
          </div>
          <h2 className="header-text">{this.props.headerText}</h2>
          <p className="recharge-text">{this.props.rechargeText}</p>
        </div>
        <div className="feature-cta">
          <div className="pro-description">
            <h3>Upgrade to Pro</h3>
            <ul>
              <li>Unlimited Connected Accounts</li>
              <li>Unlimited Contact Profiles</li>
              <li>Unlimited Snoozing</li>
              <li>Unlimited Read Receipts</li>
              <li>Unlimited Link Tracking</li>
              <li>Unlimited Reminders</li>
              <li>
                <a onClick={this.onGoToFeatures}>Dozens of other features!</a>
              </li>
            </ul>
          </div>

          <button className="btn btn-large btn-cta btn-emphasis" onClick={this.onUpgrade}>
            Upgrade
          </button>
        </div>
      </div>
    );
  }
}

module.exports = FeatureUsedUpModal