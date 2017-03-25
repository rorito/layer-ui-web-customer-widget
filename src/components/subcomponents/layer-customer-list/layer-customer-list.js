/**
 * Adds a View where the user's conversations are listed.
 *
 * This view wraps a layerUI.components.ConversationsListPanel.List.
 *
 * TODO: Implement an elegant mechanism for automatically identifying all ConversationList properties and exposing them as properties on this view.
 *
 * @class layerUICustomer.ListTab
 * @mixin layerUICustomer.mixins.Tab
 * @mixin layerUI.mixins.FocusOnKeydown
 * @extends layerUI.components.Component
 */

import { registerComponent } from 'layer-ui-web';
import tab from '../../../mixins/tab';
import FocusOnKeydown from 'layer-ui-web/lib-es5/mixins/focus-on-keydown';

registerComponent('layer-customer-list', {
  mixins: [tab, FocusOnKeydown],
  events: [],
  properties: {

    /**
     * This widget requires a `query` property; this is generated and passed in by the controller.
     *
     * @property {layer.ConversationQuery} query
     */
    query: {
      set(value) {
        this.nodes.listPanel.query = value;
      },
    },

    /**
     * This property simply exposes the layerUI.components.ConversationsListPanel.List.selectedId property.
     *
     * @property {String} selectedId    This is a Conversation ID
     */
    selectedId: {
      set(value) {
        this.nodes.listPanel.selectedId = value;
      },
      get() {
        return this.nodes.listPanel.selectedId;
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
      set(value) {
        if (value && this.filterMode === 'open') {
          this.nodes.listPanel.filter = conversation => !this.properties.resolvedTest(conversation);
        } else {
          this.nodes.listPanel.filter = null;
        }
      },
    },

    /**
     * Enable/disable filtering on the conversation list using the filterMode.
     *
     * * 'open': Only show conversations that fail the layerUICustomer.ListTab.resolvedTest.
     * * 'all': Show all conversations
     *
     * @property {String} [filterMode=open]
     */
    filterMode: {
      value: 'open',
      set(value) {
        switch(value) {
          case 'open':
            if (this.resolvedTest) {
              this.nodes.listPanel.filter = conversation => !this.properties.resolvedTest(conversation);
            } else {
              this.nodes.listPanel.filter = null;
            }
            this.nodes.filterAllButton.classList.remove('layer-toggle-selected');
            this.nodes.filterOpenButton.classList.add('layer-toggle-selected');
            break;
          case 'all':
            this.nodes.listPanel.filter = null;
            this.nodes.filterOpenButton.classList.remove('layer-toggle-selected');
            this.nodes.filterAllButton.classList.add('layer-toggle-selected');
            break;
        }
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
      set(value) {
        this.classList[value ? 'add' : 'remove']('layer-list-filter-toggles-enabled');
      },
    },

    /**
     * Set the label of the 'Show All' button that shows all conversations.
     *
     * ```
     * widget.showAllLabel = 'Show All';
     * ```
     *
     * @property {String} showAllLabel
     */
    showAllLabel: {
      set(value) {
        this.nodes.filterAllButton.innerHTML = value;
      }
    },

    /**
     * Set the label of the 'Show Current' button that shows all unresolved conversations.
     *
     * ```
     * widget.showCurrentLabel = 'Show Current';
     * ```
     *
     * @property {String} showCurrentLabel
     */
    showCurrentLabel: {
      set(value) {
        this.nodes.filterOpenButton.innerHTML = value;
      }
    },

    /**
     * Set the title for this view.
     *
     * ```
     * widget.title = 'So many conversations!';
     * ```
     *
     * @property {string} title
     */
    title: {
      set(value) {
        this.nodes.titleText.innerHTML = value;
      },
    },
  },
  methods: {
    // Setup initial values and event handlers
    onCreate() {
      this.nodes.filterAllButton.addEventListener('click', this._changeFilter.bind(this));
      this.nodes.filterOpenButton.addEventListener('click', this._changeFilter.bind(this));
      this.nodes.listPanel.onRenderListItem = this.onRenderItem.bind(this);
    },

    /**
     * Whenever a conversation-list-item is rendered, call this method to mark them as resolved/unresolved.
     *
     * For use by the Conversation List only.
     *
     * @method onRenderItem
     * @private
     */
    onRenderItem(widget) {
      const conversation = widget.item;
      const isResolved = this.resolvedTest(conversation);
      const resolvedNode = widget.querySelector('.layer-conversation-resolved');
      if (!isResolved && resolvedNode) {
        resolvedNode.parentNode.removeChild(resolvedNode);
      } else if (isResolved && !resolvedNode) {
        var newNode = document.createElement('i');
        newNode.classList.add('layer-conversation-resolved');
        widget.querySelector('.layer-list-item').appendChild(newNode);
      }
    },

    /**
     * Whenever a key press is detected within the widget that is not within an input, focus on the composer.
     *
     * @method onKeyDown
     * @private
     */
    onKeyDown() {
      this.nodes.listComposer.focus();
    },

    /**
     * Any time the user clicks to change the list filter, this is called.
     *
     * @method _changeFilter
     * @param {Event} evt
     * @private
     */
    _changeFilter(evt) {
      if (evt.target === this.nodes.filterAllButton) {
        this.filterMode = 'all';
      } else {
        this.filterMode = 'open';
      }
    },
  },
});
