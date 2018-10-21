const { ComponentRegistry, ExtensionRegistry } = require('mailspring-exports');
const { HasTutorialTip } = require('mailspring-component-kit');
const LinkTrackingButton = require('./link-tracking-button');
const LinkTrackingComposerExtension = require('./link-tracking-composer-extension');
const LinkTrackingMessageExtension = require('./link-tracking-message-extension');
const {PRODUCT_NAME} = require('mailspring/CONFIG')

const LinkTrackingButtonWithTutorialTip = HasTutorialTip(LinkTrackingButton, {
  title: 'Track links in this email',
  instructions:
    `When link tracking is turned on, ${PRODUCT_NAME} will notify you when recipients click links in this email.`,
});

function activate() {
  ComponentRegistry.register(LinkTrackingButtonWithTutorialTip, {
    role: 'Composer:ActionButton',
  });

  ExtensionRegistry.Composer.register(LinkTrackingComposerExtension);

  ExtensionRegistry.MessageView.register(LinkTrackingMessageExtension);
}

function serialize() {}

function deactivate() {
  ComponentRegistry.unregister(LinkTrackingButtonWithTutorialTip);
  ExtensionRegistry.Composer.unregister(LinkTrackingComposerExtension);
  ExtensionRegistry.MessageView.unregister(LinkTrackingMessageExtension);
}

module.exports = {
  activate,
  serialize,
  deactivate
}