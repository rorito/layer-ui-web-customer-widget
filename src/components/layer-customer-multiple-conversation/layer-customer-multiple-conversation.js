/**
 * Add this widget to your page if your customer may have multiple conversations with your company's staff.
 *
 * Use cases:
 *
 * 1. Customer's raise tickets/issues, each conversation represents a separate issue.
 * 1. Different staff at your company discuss different topics
 * 1. Each purchase is a separate conversation
 *
 * Usage:
 *
 * ```
 * import LayerUI from 'layer-ui-web';
 * import from 'layer-ui-web-customer-support/lib-es6/layer-customer-multiple-conversation/layer-customer-multiple-conversation';
 *
 * LayerUI.init({
 *     appId: "layer:///apps/staging/UUID"
 * });
 *
 *
 * <layer-customer-multiple-conversation
 *     conversation-participants='jane-the-support-agent'
 *     conversation-metadata='{"conversationName": "New Customer", "resolved": "false"}'>
 * </layer-customer-multiple-conversation>
 * ```
 *
 * @class layerUICustomer.MultipleConversationWidget
 * @mixin layerUICustomer.CustomerWidgetMixin
 */

import { registerComponent } from 'layer-ui-web';
import '../subcomponents/layer-customer-chat-button/layer-customer-chat-button';
import '../subcomponents/layer-customer-welcome/layer-customer-welcome';
import '../subcomponents/layer-customer-chat/layer-customer-chat';
import '../subcomponents/layer-customer-list/layer-customer-list';
import CustomerWidgetMixin from '../layer-customer-widget-mixin';

registerComponent('layer-customer-multiple-conversation', {
  mixins: [CustomerWidgetMixin],
  events: [],
  properties: {

    /**
     * Set this property when transitioning to the Chat View; this specifies what conversation the user will chat within.
     *
     * This value is initially null, and will be assigned a value when:
     *
     * 1. The user types in a message and a conversation is created
     * 2. The user selects a Conversation from the Conversation List
     *
     * This value can be set to a Conversation object, but is self populating if you do not set it.
     *
     * @property {layer.Conversation} conversation
     */
    conversation: {
      set(value) {
        this.nodes.chatTab.conversation = value;

        // Mixin handles case where we have a value; each widget handles the case where there is no value
        if (!value) {
          if (this.query && this.query.data.length) {
            this.nodes.listTab.isOpen = true;
          } else {
            this.nodes.welcomeTab.isOpen = true;
          }
        }
      },
    },

    /**
     * A customizable function for testing of a Conversation is resolved or still open.
     *
     * This will enable us to filter out resolved conversations, and to visually flag conversations as resolved.
     *
     * For apps that do not have concepts of resolved, this can be ignored.
     *
     * ```
     * widget.resolvedTest = function(conversation) {
     *    return conversation.metadata.resolved === 'true';
     * };
     * ```
     *
     * @property {Function} resolvedTest
     * @property {layer.Conversation} resolvedTest.conversation
     */
    resolvedTest: {
      type: Function,
      value: function(conversation) {
        return conversation.metadata.resolved === 'true';
      },
      set: function() {
        this.nodes.listTab.resolvedTest = this.properties.resolvedTest;
      },
    },

    /**
     * Controls whether user can toggle between resolved/unresolved conversations.
     *
     * ```
     * widget.isNavigateToResolvedEnabled = false;
     * ```
     *
     * @property {Boolean} [isNavigateToResolvedEnabled=true]
     */
    isNavigateToResolvedEnabled: {
      value: true,
      type: Boolean,
      set(value) {
        this.nodes.listTab.isNavigateToResolvedEnabled = value;
      }
    },

    /**
     * Label for button to navigate to view all conversations (resolved and unresolved).
     *
     * ```
     * widget.showAllLabel = "Show All";
     * ```
     *
     * @property {String} [showAllLabel=All]
     */
    showAllLabel: {
      value: 'All',
      set(value) {
        this.nodes.listTab.showAllLabel = value;
      }
    },

    /**
     * Label for button to navigate to view only unresolved conversations
     *
     * ```
     * widget.showCurrentLabel = "Show Current";
     * ```
     *
     * @property {String} [showCurrentLabel=Current]
     */
    showCurrentLabel: {
      value: 'Current',
      set(value) {
        this.nodes.listTab.showCurrentLabel = value;
      }
    },

    /**
     * Set the title for the conversation list.
     *
     * ```
     * widget.listTitle = "Your Tickets";
     * ```
     *
     * @property {String} [listTitle=Your Conversations]
     */
    listTitle: {
      value: 'Your Conversations',
      set(value) {
        this.nodes.listTab.title = value;
      },
    },

    /**
     * Set the title for the Chat View where the user is sending/receiving messages.
     *
     * This uses a callback function so that the title can be changed each time a conversation is selected.
     *
     * Asynchronous behaviors are supported.
     *
     * ```
     * widget.chatTitleCallback = function(conversation, callback) {
     *    callback("Your chat about " + conversation.metadata.topic);
     * };
     * ```
     *
     * @property {Function} chatTitleCallback
     * @property {layer.Conversation} chatTitleCallback.conversation   The conversation being viewed
     * @property {Function} chatTitleCallback.callback                 The callback into which to provide the title string
     * @property {String} chatTitleCallback.callback.title             The title for the Chat View
     */
    chatTitleCallback: {
      type: Function,
      set(value) {
        this.nodes.chatTab.titleCallback = value;
      },
    },
  },
  methods: {
    onCreate() {
      this.addEventListener('layer-conversation-selected', this._selectConversation.bind(this));
      this.addEventListener('layer-back-click', this.showList.bind(this));
    },
    _handleQueryChange() {
      if (!this.conversation) {
        if (this.query.data.length) {
          this.nodes.listTab.isOpen = true;
        }
      }
    },

    /**
     * Shows the Conversation List... if there are any Conversations.
     *
     * @method showList
     */
    showList() {
      this.conversation = null;
    },

    /**
     * When a conversation is selected in the list, set the conversation property.
     *
     * @method _selectConversation
     * @private
     */
    _selectConversation(evt) {
      evt.preventDefault();
      this.conversation = evt.detail.item;
    },
  },
});
