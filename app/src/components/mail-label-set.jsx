const React = require('react');
const PropTypes = require('prop-types');
const InjectedComponentSet = require('./injected-component-set');
const FocusedPerspectiveStore = require('../flux/stores/focused-perspective-store');
const CategoryStore = require('../flux/stores/category-store');
const MessageStore = require('../flux/stores/message-store');
const AccountStore = require('../flux/stores/account-store');
const { MailLabel } = require('./mail-label');
const Actions = require('../flux/actions');
const ChangeLabelsTask = require('../flux/tasks/change-labels-task');

const LabelComponentCache = {};

class MailLabelSet extends React.Component {
  static displayName = 'MailLabelSet';

  static propTypes = {
    thread: PropTypes.object.isRequired,
    messages: PropTypes.array,
    includeCurrentCategories: PropTypes.bool,
    removable: PropTypes.bool,
  };

  _onRemoveLabel(label) {
    const task = new ChangeLabelsTask({
      source: 'Label Remove Icon',
      threads: [this.props.thread],
      labelsToAdd: [],
      labelsToRemove: [label],
    });
    Actions.queueTask(task);
  }

  render() {
    const { thread, messages, includeCurrentCategories } = this.props;
    const account = AccountStore.accountForId(thread.accountId);
    const labels = [];

    if (account && account.usesLabels()) {
      const hidden = CategoryStore.hiddenCategories(thread.accountId);
      let current = FocusedPerspectiveStore.current().categories();

      if (includeCurrentCategories || !current) {
        current = [];
      }

      const ignoredIds = [].concat(hidden, current).map(l => l.id);
      const ignoredNames = MessageStore.FolderNamesHiddenByDefault;

      for (const label of thread.sortedCategories()) {
        const labelExists = CategoryStore.byId(thread.accountId, label.id);
        if (ignoredNames.includes(label.name) || ignoredIds.includes(label.id) || !labelExists) {
          continue;
        }

        if (this.props.removable) {
          labels.push(
            <MailLabel label={label} key={label.id} onRemove={() => this._onRemoveLabel(label)} />
          );
        } else {
          if (LabelComponentCache[label.id] === undefined) {
            LabelComponentCache[label.id] = <MailLabel label={label} key={label.id} />;
          }
          labels.push(LabelComponentCache[label.id]);
        }
      }
    }
    return (
      <InjectedComponentSet
        inline
        containersRequired={false}
        matching={{ role: 'Thread:MailLabel' }}
        className="thread-injected-mail-labels"
        exposedProps={{ thread, messages }}
      >
        {labels}
      </InjectedComponentSet>
    );
  }
}

module.exports = MailLabelSet