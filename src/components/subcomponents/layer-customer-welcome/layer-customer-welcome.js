/**
 * The welcome view that welcomes the user to the chat experiences and prompts them to being.
 *
 * @class layerUICustomer.WelcomeTab
 * @mixin layerUICustomer.mixins.Tab
 * @mixin layerUI.mixins.FocusOnKeydown
 * @extends layerUI.components.Component
 */

import { registerComponent } from 'layer-ui-web';
import tab from '../../../mixins/tab';
import FocusOnKeydown from 'layer-ui-web/lib-es5/mixins/focus-on-keydown';

registerComponent('layer-customer-welcome', {
  mixins: [tab, FocusOnKeydown],
  events: [],
  properties: {

    /**
     * The view needs a layer.Client; this is provided by the controller.
     *
     * @property {layer.Client} client
     */
    client: {
      set() {
        this.nodes.welcomeComposer.client = this.client;
      }
    },

    /**
     * Any HTML elements provided here will be rendered on top of the view.
     *
     * This is presumed to be some sort of Welcome message.
     *
     * @property {HTMLElement} welcomeNodes
     */
    welcomeNodes: {
      set() {
        this.nodes.welcomeNote.innerHTML = '';
        this.nodes.welcomeNote.appendChild(this.welcomeNodes);
      }
    },
  },
  methods: {
    onCreate() {
    },

    /**
     * Any time a key press is detected in this view that isn't received by an input, focus on the Composer.
     *
     * @method onKeyDown
     * @private
     */
    onKeyDown() {
      this.nodes.welcomeComposer.focus();
    },
  },
});
