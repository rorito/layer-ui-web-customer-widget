describe("Chat Tab", function() {

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
    el = document.createElement('layer-customer-chat');
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

  describe("The conversation property", function() {
    it("Should call _updateTitle", function() {
      spyOn(el, "_updateTitle");
      el.conversation = conversation;
      expect(el._updateTitle).toHaveBeenCalledWith();
    });

    it("Should set the conversationPanel.conversation property", function() {
      expect(el.nodes.conversationPanel.conversation).toBe(null);
      el.conversation = conversation;
      expect(el.nodes.conversationPanel.conversation).toBe(conversation);
    });

    it("Should call _updateTitle whenever conversations:change triggers", function() {
      el.conversation = conversation;
      // updateTitle is already bound; but titleCallback can be spied on instead
      spyOn(el, "titleCallback");
      conversation.trigger("conversations:change");
      expect(el.titleCallback).toHaveBeenCalled();
    });

    it("Should unsubscribe from prior conversation", function() {
      el.conversation = conversation;
      el.conversation = client.createConversation({participants: ["c"]});
      spyOn(el, "_updateTitle");
      conversation.trigger("conversations:change");
      expect(el._updateTitle).not.toHaveBeenCalledWith();
    });
  });

  describe("The titleCallback property", function() {
    it("Should default to providing a standard title", function() {
      el.title = "";
      var called = false;
      el.titleCallback(conversation, function(title) {
        expect(title).toEqual("Talking with Support");
        called = true;
      });
      expect(called).toBe(true);
    });

    it("Should default to wait for a displayName before setting a standard title", function() {
      el.title = "";
      var called = false;
      supportIdentity.syncState = layer.Constants.SYNC_STATE.LOADING;
      el.titleCallback(conversation, function(title) {
        expect(title).toEqual("Talking with Support");
        called = true;
      });
      expect(called).toBe(false);

      supportIdentity.syncState = layer.Constants.SYNC_STATE.SYNCED;
      supportIdentity.trigger('identities:loaded');
      expect(called).toBe(true);
    });

    it("Should default to use conversationName if provided", function() {
      conversation.metadata.conversationName = "metadata rules";
      el.title = "";
      var called = false;
      el.titleCallback(conversation, function(title) {
        expect(title).toEqual("metadata rules");
        called = true;
      });
      expect(called).toBe(true);
    });

    it("Should be settable to a new function", function() {
      el.titleCallback = function(conversation, callback) {
        callback("I am a title");
      };
      el.title = "";
      var called = false;
      el.titleCallback(conversation, function(title) {
        expect(title).toEqual("I am a title");
        called = true;
      });
      expect(called).toBe(true);
    });

    it("Should call _updateTitle any time its changed", function() {
      spyOn(el, "_updateTitle");
      el.titleCallback = function(conversation, callback) {
        callback("I am a title");
      };
      expect(el._updateTitle).toHaveBeenCalled();
    });
  });

  describe("The isDialogShowing and isOpen properties", function() {
    it("Should disalbe the conversationPanel if isDialog and isShowing are not both true", function() {
      el.isDialogShowing = false;
      el.isOpen = false;
      expect(el.nodes.conversationPanel.disable).toBe(true);

      el.isDialogShowing = true;
      el.isOpen = false;
      expect(el.nodes.conversationPanel.disable).toBe(true);

      el.isDialogShowing = false;
      el.isOpen = true;
      expect(el.nodes.conversationPanel.disable).toBe(true);

      el.isDialogShowing = true;
      el.isOpen = true;
      expect(el.nodes.conversationPanel.disable).toBe(false);
    });
  });

  describe("The composeButtons and composeButtonsLeft properties", function(){
    it("Should setup the conversationPanel properties", function() {
      var buttons = [document.createElement('button'),document.createElement('button')];
      var buttonsLeft = [document.createElement('button'),document.createElement('button')];

      el.composeButtons = buttons;
      expect(el.nodes.conversationPanel.composeButtons).toBe(buttons);

      el.composeButtonsLeft = buttonsLeft;
      expect(el.nodes.conversationPanel.composeButtonsLeft).toBe(buttonsLeft);
    });
  });

  describe("The onCreate method", function() {
    it("Should wire up the back button", function() {
      var called = false;
      document.body.addEventListener('layer-back-click', function() {
        called = true;
      });
      el.nodes.backButton.click();
      expect(called).toBe(true);
    });

    it("Should disable message deletion", function() {
      expect(el.nodes.conversationPanel.getMessageDeleteEnabled()).toBe(false);
    });

    it("Should disable the conversation panel until its shown", function() {
      expect(el.nodes.conversationPanel.disable).toBe(true);
    });
  });

  describe("The _handleBackClick method", function() {
    it("Should trigger a layer-back-click event", function() {
      var called = false;
      document.body.addEventListener('layer-back-click', function() {
        called = true;
      });
      el._handleBackClick();
      expect(called).toBe(true);
    });
  });

  describe("The _updateTitle method", function() {
    it("Should use the titleCallback and conversation to get a title", function() {
      el.properties.conversation = conversation;
      el.properties.titleCallback = function(conversation, callback) {
        callback("I have a title");
      };
      el._updateTitle();
      expect(el.title).toEqual("I have a title");
    });

    it("Should set the title to empty if no conversation or no callback", function() {
      el.properties.conversation = null;
      el._updateTitle();
      expect(el.title).toEqual("");

      el.properties.conversation = conversation;
      el.properties.titleCallback = null;
      el._updateTitle();
      expect(el.title).toEqual("");
    });
  });

  describe("The onKeyDown method", function() {
    it("Should call conversationPanel.focusText", function() {
      spyOn(el.nodes.conversationPanel, "focusText");
      el.onKeyDown();
      expect(el.nodes.conversationPanel.focusText).toHaveBeenCalledWith();
    });
  });
});