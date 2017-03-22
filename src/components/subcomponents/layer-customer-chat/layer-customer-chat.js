/**
 * Adds a View where the user has their conversation
 *
 * This view wraps a LayerUI.components.ConversationPanel.
 *
 * TODO: Implement an elegant mechanism for automatically identifying all ConversationPanel properties and exposing them as properties on this view.
 *
 * @class layerUICustomer.ChatTab
 * @mixin layerUICustomer.mixins.Tab
 * @mixin layerUI.mixins.FocusOnKeydown
 * @extends layerUI.components.Component
 */

import { registerComponent } from 'layer-ui-web';
import tab from '../../../mixins/tab';
import FocusOnKeydown from 'layer-ui-web/lib-es5/mixins/focus-on-keydown';

registerComponent('layer-customer-chat', {
  mixins: [tab, FocusOnKeydown],
  events: [],
  properties: {

    /**
     * Get/set the title for the tab.
     *
     * Note that this property is set by layerUICustomer.ChatTab.titleCallback;
     * which should be set to `null` if you intend on setting `title` directly.
     *
     * ```
     * widget.titleCallback = null;
     * widget.title = "My Frelling Title";
     * ```
     *
     * @property {String} title
     */
    title: {
      set(value) {
        this.nodes.titleText.innerHTML = value;
      },
    },

    /**
     * Get/set the Conversation to be viewed and messaged on.
     *
     * This property can be directly set to any layer.Conversation at any time.
     *
     * ```
     * widget.conversation = myConversation;
     * ```
     *
     * @property {layer.Conversation} conversation
     */
    conversation: {
      set(newConversation, oldConversation) {
        this.nodes.conversationPanel.conversation = newConversation;
        this._updateTitle(newConversation);

        if (oldConversation) oldConversation.off(null, null, this);
        if (newConversation) newConversation.on('conversations:change', this._updateTitle.bind(this, newConversation), this);
      },
    },

    /**
     * Provide a titleCallback to customize how the title for this view is generated from the selected conversation.
     *
     * ```
     * widget.titleCallback = function(conversation, callback) {
     *    callback("Your chat about " + conversation.metadata.topic);
     * };
     * ```
     *
     * @property {Function} titleCallback
     * @property {layer.Conversation} titleCallback.conversation   The conversation being viewed
     * @property {Function} titleCallback.callback                 The callback into which to provide the title string
     * @property {String} titleCallback.callback.title             The title for this View
     */
    titleCallback: {
      // This is the default function to use for titleCallback
      value: function(conversation, callback) {
        if (!conversation) {
          this.title = '';
        } else {
          let title = conversation.metadata.conversationName;
          if (title) {
            callback(title);
          } else {
            const supportIdentity = conversation.participants.filter(identity => !identity.sessionOwner)[0];
            if (supportIdentity) {
              if (!supportIdentity.isLoading) {
                callback('Talking with ' + supportIdentity.displayName);
              } else {
                supportIdentity.once('identities:loaded', () => {
                  callback('Talking with ' + supportIdentity.displayName);
                });
              }
            }
          }
        }
      },

      // Update the title any time this changes
      set(value) {
        this._updateTitle();
      },
    },

    /**
     * If the dialog is not showing, then it doesn't matter that this view is open; the whole UI should be disabled.
     *
     * We disable the view to insure that read receipts are not sent for messages that are scrolled into view... but not actually viewable.
     *
     * This is set by the controller, and should not be set directly.
     *
     * @property {Boolean} [isDialogShowing=false]
     * @readonly
     */
    isDialogShowing: {
      set(value) {
        var isShowing = this.isDialogShowing && this.isOpen;
        this.nodes.conversationPanel.disable = !isShowing;
      },
    },

    /**
     * If the tab is not open, then disable the view.
     *
     * We disable the view to insure that read receipts are not sent for messages that are scrolled into view... but not actually viewable.
     *
     * You can show a tab by setting this property:
     *
     * ```
     * widget.isOpen = true;
     * ```
     *
     * @property {Boolean} [isDialogShowing=false]
     */
    isOpen: {
      set(value) {
        var isShowing = this.isDialogShowing && this.isOpen;
        this.nodes.conversationPanel.disable = !isShowing;
      },
    },

    /**
     * An array of buttons (dom nodes) to be added to the Compose bar, right side.
     *
     * ```
     * widget.composeButtons = [
     *     document.createElement('button'),
     *     document.createElement('button')
     * ];
     * ```
     *
     * @property {HTMLElement[]} [composeButtons=[]]
     */
    composeButtons: {
      set(value) {
        this.nodes.conversationPanel.composeButtons = value;
      },
    },

    /**
     * An array of buttons (dom nodes) to be added to the Compose bar, left side.
     *
     * ```
     * widget.composeButtonsLeft = [
     *     document.createElement('button'),
     *     document.createElement('button')
     * ];
     * ```
     *
     * @property {HTMLElement[]} [composeButtonsLeft=[]]
     */
    composeButtonsLeft: {
      set(value) {
        this.nodes.conversationPanel.composeButtonsLeft = value;
      },
    },
  },
  methods: {

    // Setup initial values and event handlers
    onCreate() {
      this.nodes.listBackButton.addEventListener('click', this._handleBackClick.bind(this));
      this.nodes.conversationPanel.getMessageDeleteEnabled = function() {return false;};
      this.nodes.conversationPanel.disable = true;
    },

    /**
     * User clicked on back button.  Trigger the event and let the controller handle it.
     *
     * @method _handleBackClick
     * @private
     */
    _handleBackClick() {
      this.trigger('layer-back-click');
    },

    /**
     * Use the titleCallback property to set the title from the conversation.
     *
     * @method _updateTitle
     * @private
     */
    _updateTitle(conversation) {
      if (this.titleCallback) {
        if (conversation) {
          this.titleCallback(conversation, (title) => {
            this.title = title;
          });
        } else {
          this.title = "";
        }
      }
    },

    /**
     * Whenever a keypress is detected that isn't received by an input, focus on the conversationPanel's composer.
     *
     * @method onKeyDown
     */
    onKeyDown() {
      this.nodes.conversationPanel.focusText();
    },
  },
});

