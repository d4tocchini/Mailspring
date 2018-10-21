const { ComponentRegistry, ExtensionRegistry } = require('mailspring-exports');
const { HasTutorialTip } = require('mailspring-component-kit');
const OpenTrackingButton = require('./open-tracking-button');
const OpenTrackingIcon = require('./open-tracking-icon');
const OpenTrackingMessageStatus = require('./open-tracking-message-status');
const OpenTrackingComposerExtension = require('./open-tracking-composer-extension');
const {PRODUCT_NAME} = require('mailspring/CONFIG')

const OpenTrackingButtonWithTutorialTip = HasTutorialTip(OpenTrackingButton, {
  title: 'See when recipients open this email',
  instructions:
    `When enabled, ${PRODUCT_NAME} will notify you as soon as someone reads this message. Sending to a group? ${PRODUCT_NAME} shows you which recipients opened your email so you can follow up with precision.`,
});

export function activate() {
  ComponentRegistry.register(OpenTrackingButtonWithTutorialTip, { role: 'Composer:ActionButton' });

  ComponentRegistry.register(OpenTrackingIcon, { role: 'ThreadListIcon' });

  ComponentRegistry.register(OpenTrackingMessageStatus, { role: 'MessageHeaderStatus' });

  ExtensionRegistry.Composer.register(OpenTrackingComposerExtension);
}

export function serialize() {}

export function deactivate() {
  ComponentRegistry.unregister(OpenTrackingButtonWithTutorialTip);
  ComponentRegistry.unregister(OpenTrackingIcon);
  ComponentRegistry.unregister(OpenTrackingMessageStatus);
  ExtensionRegistry.Composer.unregister(OpenTrackingComposerExtension);
}
