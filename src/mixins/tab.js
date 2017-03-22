/**
 * Tab Mixin adds tab-like properties to a panel.
 *
 * @class layerUICustomer.mixins.Tab
 */

module.exports = {
  properties: {
    /**
     * The tab is currently open.
     *
     * Note that this could be true, even though the dialog/parent is hidden.
     *
     * @property {Boolean} [isOpen=false]
     */
    isOpen: {
      value: false,
      set(value) {
        this.style.display = value ? '' : 'none';
        if (value) {
          var nodes = this.parentNode.childNodes;
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i] !== this) nodes[i].isOpen = false;
          }

          // Must wait until rendering is completed in order to call focus.
          setTimeout(() => this.focus(), 1);
        }
      },
    },
  },
  methods: {
    onCreate() {
      this.classList.add('layer-tab');
    }
  },
};
