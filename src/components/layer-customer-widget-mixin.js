/**
 * Main Components of this library all use this mixin to provide a set of standard behaviors.
 *
 * @class layerUICustomer.CustomerWidgetMixin
 * @extends layer.UI.components.Component
 */
//import Layer from '@layerhq/web-xdk';
import Layer from '../../node_modules/@layerhq/web-xdk/lib/index';
const MainComponent = Layer.UI.mixins.MainComponent;
const Query = Layer.Core.Query;
const TextModel = Layer.Core.Client.getMessageTypeModelClass('TextModel');

module.exports = {
  mixins: [MainComponent],

  /**
   * This event is triggered before creating a Conversation and sending a message on that Conversation.
   *
   * You can use this event to modify the conversation or message prior to their being sent,
   * and optionally, you can call `evt.preventDefault()` to prevent them from being sent (but you can still
   * send them yourself).
   *
   * ```
   * document.body.addEventListener('layer-create-conversation-and-message', function(evt) {
   *   var conversation = evt.detail.conversation;
   *   var message = evt.detail.message;
   *   var notification = evt.detail.notification;
   *   var text = message.parts[0].body;
   *   conversation.setMetadataProperties({"First Message": text});
   *   if (text.match(/help/)) {
   *     evt.preventDefault():
   *     alert("I'm sorry, we aren't very helpful");
   *   } else {
   *     message.addPart({
   *       body: "Certified as being a message that doesn't ask for help",
   *       mimeType: "text/unhelpful"
   *     });
   *     notification.title = 'Incoming!';
   *   }
   * });
   * ```
   *
   * @event layer-create-conversation-and-message
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Core.Conversation} evt.detail.conversation   The conversation generated for this message
   * @param {layer.Core.Message} evt.detail.message             The message generated for this message
   * @param {Object} evt.detail.notification               The notification that will be sent with this message
   */

  /**
   * This property function is triggered before creating a Conversation and sending a message on that Conversation.
   *
   * You can use this event to modify the conversation or message prior to their being sent,
   * and optionally, you can call `evt.preventDefault()` to prevent them from being sent (but you can still
   * send them yourself).
   *
   * ```
   * widget.onCreateConversationAndMessage = function(evt) {
   *   var conversation = evt.detail.conversation;
   *   var message = evt.detail.message;
   *   var notification = evt.detail.notification;
   *   var text = message.parts[0].body;
   *   conversation.setMetadataProperties({"First Message": text});
   *   if (text.match(/help/)) {
   *     evt.preventDefault():
   *     alert("I'm sorry, we aren't very helpful");
   *   } else {
   *     message.addPart({
   *       body: "Certified as being a message that doesn't ask for help",
   *       mimeType: "text/unhelpful"
   *     });
   *     notification.title = 'Incoming!';
   *   }
   * });
   * ```
   *
   * @property {Function} onCreateConversationAndMessage
   * @property {Event} onCreateConversationAndMessage.evt
   * @property {Object} onCreateConversationAndMessage.evt.detail
   * @property {layer.Core.Conversation} onCreateConversationAndMessage.evt.detail.conversation   The conversation generated for this message
   * @property {layer.Core.Message} onCreateConversationAndMessage.evt.detail.message             The message generated for this message
   */
  events: ['layer-create-conversation-and-message'],
  properties: {

    /*
     * Documented for each widget.
     * Any time the Conversation changes we need to:
     * 1. pass that to the chatTab
     * 2. Open the chatTab if we have a conversation
     */
    conversation: {
      set(value) {
        this.nodes.chatTab.conversation = value;

        // Open the chat tab if/when we have a fully created conversation;
        // else use the welcome tab
        if (value) {
          this.nodes.chatTab.isOpen = true;
        }
      },
    },

    /**
     * The query used to find your Conversation(s)
     *
     * @property {layer.Query} query
     * @readonly
     */
    query: {},


    /**
     * Each customer starts on the welcome tab; put a custom welcome message on the welcome tab.
     *
     * ```
     * var div = document.createElement('div');
     * div.innerHTML = "Howdy; do you like ping pong or foosball? Let us know!";
     * widget.welcomeNodes = div;
     * ```
     *
     * @property {HTMLElement} welcomeNodes
     */
    welcomeNodes: {
      type: HTMLElement,
      set() {
        this.nodes.welcomeTab.welcomeNodes = this.welcomeNodes;
      }
    },

    /**
     * Identity ID for the customer support staff (or bot) that the user will create a conversation with.
     *
     * ```
     * widget.conversationParticipants = ['layer:///identities/support-beam'];
     *
     * // OR
     * <widget
     *     conversation-participants='layer:///identities/jane-the-support-agent'>
     * </widget>
     * ```
     *
     * @property {String[]} conversationParticipants
     */
    conversationParticipants: {
      set(value) {
        if (typeof value === 'string') {
          this.properties.conversationParticipants = value.split(/\s*,\s*/);
        }
      }
    },

    /**
     * Metadata to create a Conversation with.  Has no impact on existing Conversations.
     *
     * ```
     * widget.conversationMetadata = {
     *    "resolved": "false",
     *    "conversationName": "Support Call"
     * };
     *
     * // OR
     * <widget
     *     conversation-metadata='{"resolved": "false", "conversationName": "Support Call"}'>
     * </widget>
     * ```
     *
     * @property {Object} conversationMetadata
     */
    conversationMetadata: {
      set(value) {
        if (typeof value === 'string') {
          try {
            this.properties.conversationMetadata = JSON.parse(value);
          } catch(e) {}
        }
      },
    },

    /**
     * Is the dialog showing?
     *
     * Set this property to true to show the dialog.  This is done for you when the
     * user clicks the `<layer-customer-chat-button />` widget.
     *
     * ```
     * if (!widget.isDialogShowing) {
     *     widget.isDialogShowing = true;
     * } else {
     *     console.log('Already Showing');
     * }
     * ```
     *
     * This widget gets a `layer-open-dialog` css class when `isDialogShowing` is true.
     *
     * @property {Boolean} isDialogShowing
     */
    isDialogShowing: {
      value: false,
      set(value) {
        this.classList[value ? 'add' : 'remove']('layer-open-dialog');
        this.nodes.floatingButton.isOpen = value;

        this.nodes.chatTab.isDialogShowing = value;
        if (this.nodes.listTab) this.nodes.listTab.isDialogShowing = value;
        this.nodes.welcomeTab.isDialogShowing = value;
      },
    },
  },
  methods: {

    /*
     * Initialize properties that need initial values;
     * Setup event handlers
     */
    onCreate() {
      this.addEventListener('layer-customer-chat-button-click', this.toggleOpen.bind(this));
      this.addEventListener('layer-send-message', this._createConversationAndSendMessage.bind(this));
      if (!this.properties.conversationMetadata) this.properties.conversationMetadata = {};
      if (!this.properties.conversationParticipants) this.properties.conversationParticipants = [];
      this.nodes.welcomeTab.isOpen = true;
    },

    /*
     * Initialize any properties that depend upon this widget having received its properties already.
     *
     * That includes setting up a query and its event handlers.
     */
    onAfterCreate() {
      if (!this.query) {
        this.query = this.client.createQuery({
          model: Query.Conversation,
          paginationWindow: 20,
        });
      }
      this.query.on('change', this._handleQueryChange, this);

      if (this.nodes.listTab) this.nodes.listTab.query = this.query;
    },

    /**
     * The Conversation Query has had a change in its data.
     *
     * Any time this happens, update the widget's `floatingButton.hasUnread` property.
     *
     * @method _handleQueryChange
     * @private
     */
    _handleQueryChange() {
      this._updateUnread();
    },

    /**
     * Create the Conversation and send the message.
     *
     * When the user types in a message in the welcome tab and hits send, this
     * method will fire to create the conversations, and then create the user's message
     * on this conversations.
     *
     * Triggers the layer-create-conversation-and-message event allowing clients to override this behavior
     *
     * @method _createConversationAndSendMessage
     * @param {Event} evt
     * @private
     */
    _createConversationAndSendMessage(evt) {
      if (!evt.detail.conversation) {
        evt.preventDefault();
        const conversation = this.client.createConversation({
          distinct: false,
          participants: this.conversationParticipants.concat(this.client.user),
          metadata: this.conversationMetadata
        });
        const message =  conversation.createMessage({
          parts: evt.detail.parts,
        });
        const textPart = message.parts.filter(item => item.mimeType === TextModel.MIMEType)[0];
        const text = textPart ? JSON.parse(textPart).text : 'New File';
        const notification = {
          title: "New Conversation",
          text,
        };
        if (this.trigger('layer-create-conversation-and-message', { conversation, message, notification })) {
          this.conversation = conversation;
          message.send(notification);
        }
      }
    },


    /**
     * This method is called whenever the user clicks on the Chat Button to toggle display of the dialog.
     *
     * It can be used to directly toggle... but it is suggested that you instead use the `isDialogShowing` property instead.
     *
     * @method toggleOpen
     */
    toggleOpen() {
      this.isDialogShowing = !this.isDialogShowing;
    },

    /**
     * Recalculate whether there are any conversations that are unread.
     *
     * Checks all query data to see if any Conversation's last message is unread,
     * and if it is, sets the floating button's `hasUnread` proeprty to `true`.
     *
     * @method _updateUnread
     * @private
     */
    _updateUnread() {
      const unreadConversations = this.query.data.filter(conversation => conversation.lastMessage && conversation.lastMessage.isUnread);
      this.nodes.floatingButton.hasUnread = Boolean(unreadConversations.length);
    },
  },
};
