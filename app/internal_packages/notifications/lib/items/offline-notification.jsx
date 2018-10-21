const { OnlineStatusStore, React, PropTypes, Actions } = require('mailspring-exports');
const { Notification, ListensToFluxStore } = require('mailspring-component-kit');
const {PRODUCT_NAME} = require('mailspring/CONFIG')

function OfflineNotification({ isOnline, retryingInSeconds }) {
  if (isOnline) {
    return false;
  }
  const subtitle = retryingInSeconds
    ? `Retrying in ${retryingInSeconds} second${retryingInSeconds > 1 ? 's' : ''}`
    : `Retrying now...`;

  return (
    <Notification
      className="offline"
      title={PRODUCT_NAME + " is offline"}
      subtitle={subtitle}
      priority="5"
      icon="volstead-offline.png"
      actions={[
        {
          id: 'try_now',
          label: 'Try now',
          fn: () => Actions.checkOnlineStatus(),
        },
      ]}
    />
  );
}
OfflineNotification.displayName = 'OfflineNotification';
OfflineNotification.propTypes = {
  isOnline: PropTypes.bool,
  retryingInSeconds: PropTypes.number,
};

module.exports = ListensToFluxStore(OfflineNotification, {
  stores: [OnlineStatusStore],
  getStateFromStores() {
    return {
      isOnline: OnlineStatusStore.isOnline(),
      retryingInSeconds: OnlineStatusStore.retryingInSeconds(),
    };
  },
});
