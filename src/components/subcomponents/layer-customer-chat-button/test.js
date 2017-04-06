describe("Chat Button", function() {

var el, testRoot, client, conversation, user, supportIdentity;

  beforeEach(function() {
    jasmine.clock().install();

    client = new layer.Client({
      appId: 'layer:///apps/staging/Fred'
    });
    client.user = new layer.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      displayName: 'Frodo the Dodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true,
      sessionOwner: true
    });

    supportIdentity = new layer.Identity({
      client: client,
      userId: "support",
      displayName: "Support",
      id: "layer:///identities/support",
      isFullIdentity: true
    });

    client._clientAuthenticated();

    conversation = client.createConversation({participants: [client.user, supportIdentity], distinct: true});

    if (layerUI.components['layer-conversation-panel'] && !layerUI.components['layer-conversation-panel'].classDef) layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-customer-chat-button');
    el.client = client;
    testRoot.appendChild(el);
    CustomElements.takeRecords();
    layer.Util.defer.flush();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    document.body.removeChild(testRoot);
    client.destroy();
  });

  describe("The isOpen openHTML and closedHTML properties", function() {
    it("Should toggle floating-chat-icon-open and floating-chat-icon-closed", function() {
      el.className = "";
      el.isOpen = true;
      expect(el.classList.contains('floating-chat-icon-open')).toBe(true);
      el.isOpen = false;
      expect(el.classList.contains('floating-chat-icon-open')).toBe(false);
      expect(el.classList.contains('floating-chat-icon-closed')).toBe(true);
      el.isOpen = true;
      expect(el.classList.contains('floating-chat-icon-open')).toBe(true);
      expect(el.classList.contains('floating-chat-icon-closed')).toBe(false);
    });

    it("Should toggle the html", function() {
      el.openHTML = "Frodo";
      el.closedHTML = "Dodo";
      el.isOpen = true;
      expect(el.innerHTML).toEqual("Frodo");
      el.isOpen = false;
      expect(el.innerHTML).toEqual("Dodo");
    });
  });

  describe("The hasUnread property", function() {
    it("Should toggle layer-has-unread-conversations", function() {
      el.hasUnread = true;
      expect(el.classList.contains('layer-has-unread-conversations')).toBe(true);
      el.hasUnread = false;
      expect(el.classList.contains('layer-has-unread-conversations')).toBe(false);
    });
  });

  describe("The methods", function() {
    it("Should wire _handleClick to the button click and trigger an event", function() {
      var called = false;
      var isOpen = null;
      el.addEventListener("layer-customer-chat-button-click", function(evt) {
        called = true;
        isOpen = evt.detail.open;
      });

      el.click();
      expect(called).toBe(true);
      expect(isOpen).toBe(true);

      el.isOpen = true;
      el.click();
      expect(isOpen).toBe(false);
    });
  });
});