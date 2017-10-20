/**
 * Floating button for opening up the chat UI.
 *
 * Consists of 3 states:
 *
 * * Dialog is closed, no unread messages
 * * Dialog is closed, there are unread messages
 * * Dialog is open
 *
 * Generates a `layer-customer-chat-button-click` event when the user clicks.
 *
 * TODO: Enable the event to be cancelable.  Currently intercepted by controller before anything can be done.
 *
 * @class layerUICustomer.ChatButton
 * @extends layer.UI.components.Component
 */

//import Layer from '@layerhq/web-xdk';
import Layer from '../../../../node_modules/@layerhq/web-xdk/lib/index';
const registerComponent = Layer.UI.registerComponent;

registerComponent('layer-customer-chat-button', {
  mixins: [],
  events: [],
  properties: {
    openHTML: {
      value: '\uf00d',
      set() {
        this._udpateHtml();
      },
    },
    closedHTML: {
      value: '\uf0e5',
      set() {
        this._udpateHtml();
      },
    },
    /**
     * isOpen property inidicates if the dialog is open or closed.
     *
     * Set this property to change the button's state; this won't affect the actual Dialog.
     *
     * Typically set by the controller.
     *
     * @property {Boolean} [isOpen=false]
     */
    isOpen: {
      value: false,
      set(value) {
        this.classList[value ? 'add' : 'remove']('floating-chat-icon-open');
        this.classList[value ? 'remove' : 'add']('floating-chat-icon-closed');
        this._udpateHtml();
      }
    },

    /**
     * There are unread converations; render an indicator of this.
     *
     * Typically set by the controller.
     *
     * @property {Boolean} [hasUnread=false]
     */
    hasUnread: {
      set(value) {
        this.classList[value ? 'add' : 'remove']('layer-has-unread-conversations');
      }
    }
  },
  methods: {
    onCreate() {
      this.addEventListener('click', this._handleClick.bind(this));
    },

    /**
     * When the user clicks the button, emit a `layer-customer-chat-button-click` event.
     *
     * @method _handleClick
     * @param {Event} evt
     * @private
     */
    _handleClick(evt) {
      this.trigger('layer-customer-chat-button-click', { open: !this.isOpen });
    },

    _udpateHtml() {
      this.innerHTML = this.isOpen ? this.openHTML : this.closedHTML;
    }
  },
});
