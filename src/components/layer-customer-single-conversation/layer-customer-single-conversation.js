/**
 * Add this widget to your page if your customer has a single conversation with your company's staff.
 *
 * Use cases:
 *
 * 1. Customer has a long term relationship with a single person at your company such that they should only ever see
 *    a single conversation, with its ongoing history.
 * 1. All of the customer's history with your company should be available to both your customer and your staff in the form
 *    of one long conversation
 * 1. Your philosophy around conversations is NOT to have them as a single topic, to be closed when resolved,
 *    start a new conversation for a new topic.  If your conversations are support tickets, then this is not the right widget.
 *
 * Usage:
 *
 * ```
 * import LayerUI from 'layer-ui-web';
 * import from 'layer-ui-web-customer-support/lib-es6/layer-customer-single-conversation/layer-customer-single-conversation';
 *
 * LayerUI.init({
 *     appId: "layer:///apps/staging/UUID"
 * });
 *
 *
 * <layer-customer-single-conversation
 *     new-participant='jane-the-support-agent'
 *     new-metadata='{"conversationName": "New Customer"}'>
 * </layer-customer-single-conversation>
 * ```
 *
 * @class layerUICustomer.SingleConversationWidget
 * @mixin layerUICustomer.CustomerWidgetMixin
 */

import { registerComponent } from 'layer-ui-web';
import '../subcomponents/layer-customer-chat-button/layer-customer-chat-button';
import '../subcomponents/layer-customer-welcome/layer-customer-welcome';
import '../subcomponents/layer-customer-chat/layer-customer-chat';
import CustomerWidgetMixin from '../layer-customer-widget-mixin';

registerComponent('layer-customer-single-conversation', {
  mixins: [CustomerWidgetMixin],
  events: [],
  properties: {

    /**
     * The single Conversation that the user has with the support agent.
     *
     * This value is initially null, and will be assigned a value when:
     *
     * 1. The user types in a message and a conversation is created
     * 2. The Query to get all Conversations returns with a Conversation (if none found, continues to be null)
     *
     * This value can be set to a Conversation object, but is self populating if you do not set it.
     *
     * @property {layer.Conversation} conversation
     */
    conversation: {
      set(value) {
        // Mixin handles what happens if there is a value; each widget has a different behavior if there is not a conversation
        if (!value) {
          this.nodes.welcomeTab.isOpen = true;
        }
      },
    },

    /**
     * The title for the Chat View.
     *
     * @property {String} title
     */
    title: {
      set(value) {
        if (value) {
          this.nodes.chatTab.titleCallback = null;
        }
        this.nodes.chatTab.title = value;
      }
    },
  },
  methods: {
    /*
     * Documented in CustomerWidgetMixin
     * This method updates the conversation property any time we lack a conversation property and there has been a change in the Query data.
     */
    _handleQueryChange() {
      if (!this.conversation) {
        if (this.query.data.length) {
          this.conversation = this.query.data[0];
        }
      }
    },
  },
});
