describe("Single Conversation Widget", function() {

var el, testRoot, client, conversation, user;

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

    client._clientAuthenticated();

    conversation = client.createConversation({participants: ["a", "b"], distinct: true});

    if (layerUI.components['layer-conversation-panel'] && !layerUI.components['layer-conversation-panel'].classDef) layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-customer-single-conversation');
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

  describe('The conversation property', function() {
    it("Should show and setup the chat tab if set", function() {
      expect(el.nodes.chatTab.conversation).toBe(null);
      expect(el.nodes.chatTab.isOpen).toBe(false);

      el.conversation = conversation;

      expect(el.nodes.chatTab.conversation).toBe(conversation);
      expect(el.nodes.chatTab.isOpen).toBe(true);
    });

    it("Should show the welcome tab if unset", function() {
      el.conversation = conversation;
      el.nodes.chatTab.isOpen = true;

      el.conversation = null;

      expect(el.nodes.chatTab.conversation).toBe(null);
      expect(el.nodes.chatTab.isOpen).toBe(false);
    });
  });

  describe('The welcomeNodes property', function() {
    it("Should set the welcomeTab welcomeNodes", function() {
      var div = document.createElement("div");
      el.welcomeNodes = div;
      expect(el.nodes.welcomeTab.welcomeNodes).toBe(div);
    });

    it("Should update the welcomeTab welcomeNodes", function() {
      var div1 = document.createElement("div");
      var div2 = document.createElement("div");
      el.welcomeNodes = div1;
      expect(el.nodes.welcomeTab.welcomeNodes).toBe(div1);

      el.welcomeNodes = div2;
      expect(el.nodes.welcomeTab.welcomeNodes).toBe(div2);
    });

    it("Should access the welcomeTab welcomeNodes", function() {
      var div1 = document.createElement("div");
      var div2 = document.createElement("div");
      el.welcomeNodes = div1;
      el.welcomeNodes.appendChild(div2);
      expect(el.welcomeNodes.firstChild).toBe(div2);
    });
  });

  describe("The newMetadata property", function() {
    it("Should parse json string", function() {
      el.newMetadata = JSON.stringify({hey: "ho"});
      expect(el.newMetadata).toEqual({
        hey: "ho"
      });
    });

    it("Should accept an object", function() {
      el.newMetadata = {hey: "ho"};
      expect(el.newMetadata).toEqual({
        hey: "ho"
      });
    });
  });

  describe("The isDialogShowing property", function() {
    it("Should add/remove the layer-open-dialog css class", function() {
      expect(el.classList.contains('layer-open-dialog')).toBe(false);

      el.isDialogShowing = true;
      expect(el.classList.contains('layer-open-dialog')).toBe(true);

      el.isDialogShowing = false;
      expect(el.classList.contains('layer-open-dialog')).toBe(false);
    });

    it("Should update the floating button state", function() {
      expect(el.nodes.floatingButton.isOpen).toBe(false);

      el.isDialogShowing = true;
      expect(el.nodes.floatingButton.isOpen).toBe(true);

      el.isDialogShowing = false;
      expect(el.nodes.floatingButton.isOpen).toBe(false);
    });

    it("Should tell all tabs that the dialog is/is not showing", function() {
      el.isDialogShowing = true;
      expect(el.nodes.chatTab.isDialogShowing).toBe(true);
      expect(el.nodes.welcomeTab.isDialogShowing).toBe(true);

      el.isDialogShowing = false;
      expect(el.nodes.chatTab.isDialogShowing).toBe(false);
      expect(el.nodes.welcomeTab.isDialogShowing).toBe(false);
    });
  });

  describe("The composeButtons properties", function() {
    it("Should set and clear composeButtons", function() {
      var div = document.createElement("div");

      el.composeButtons = [div];
      expect(el.nodes.chatTab.composeButtons).toEqual([div]);

      el.composeButtons = [];
      expect(el.nodes.chatTab.composeButtons).toEqual([]);
    });

    it("Should set and clear composeButtonsLeft", function() {
      var div = document.createElement("div");

      el.composeButtonsLeft = [div];
      expect(el.nodes.chatTab.composeButtonsLeft).toEqual([div]);

      el.composeButtonsLeft = [];
      expect(el.nodes.chatTab.composeButtonsLeft).toEqual([]);
    });
  });

  describe("The onCreate method", function() {
    it("Should wire up toggleOpen on layer-customer-chat-button-click event", function() {
      expect(el.isDialogShowing).toBe(false);
      el.trigger('layer-customer-chat-button-click');
      expect(el.isDialogShowing).toBe(true);
      el.trigger('layer-customer-chat-button-click');
      expect(el.isDialogShowing).toBe(false);
    });

    it("Should wire up createConversationAndSendMessage on layer-send-message event", function() {
      var called = false;
      el.addEventListener('layer-create-conversation-and-message', function(evt) {
        evt.preventDefault();
        called = true;
      });

      el.trigger("layer-send-message", {
        parts: [new layer.MessagePart("Hey")]
      });
      expect(called).toBe(true);
    });

    it("Should initialize newMetadata", function() {
      expect(el.newMetadata).toEqual({});
    });

    it("Should set the welcomeTab to open", function() {
      expect(el.nodes.welcomeTab.isOpen).toBe(true);
    });
  });

  describe("The onAfterCreate() method", function() {
    it("Should create a query if one isn't already assigned", function() {
      expect(el.query.model).toEqual(layer.Query.Conversation);
      var query = el.query;

      el.properties._internalState.onAfterCreateCalled = false;
      el.onAfterCreate();
      expect(el.query).toBe(query);

      spyOn(el, "_updateUnread");
      query.trigger("change");
      expect(el._updateUnread).toHaveBeenCalled();
    });
  });

  describe("The _createConversationAndSendMessage() method", function() {
    it("Should create a suitable conversation", function() {
      el.newParticipant = "layer:///identities/howdy"
      el.newMetadata = {howdy: "ho"};
      expect(el.conversation).toBe(null);
      var preventSpy = jasmine.createSpy("spy");

      el._createConversationAndSendMessage({
        preventDefault: preventSpy,
        detail: {
          parts: [new layer.MessagePart("hi")]
        }
      });

      expect(el.conversation).not.toBe(null);
      expect(el.conversation.participants).toEqual(jasmine.arrayContaining([
        client.user, client.getIdentity("layer:///identities/howdy")
      ]));
      expect(el.conversation.metadata).toEqual({howdy: "ho"});
      expect(preventSpy).toHaveBeenCalled();
    });

    it("Should create a suitable message", function() {
      el.newParticipant = "layer:///identities/howdy"
      el.newMetadata = {howdy: "ho"};
      expect(el.conversation).toBe(null);
      var preventSpy = jasmine.createSpy("spy");

      el._createConversationAndSendMessage({
        preventDefault: preventSpy,
        detail: {
          parts: [new layer.MessagePart("hi")]
        }
      });

      expect(el.conversation.lastMessage.parts[0].body).toEqual("hi");
      expect(el.conversation.lastMessage.parts[0].mimeType).toEqual("text/plain");
      expect(el.conversation.lastMessage.parts.length).toEqual(1);
    });

    it("Should trigger a cancelable event", function() {
      el.addEventListener('layer-create-conversation-and-message', function(evt) {
        evt.preventDefault();
      });
      el.newParticipant = "layer:///identities/howdy"
      el.newMetadata = {howdy: "ho"};
      expect(el.conversation).toBe(null);
      var preventSpy = jasmine.createSpy("spy");

      el._createConversationAndSendMessage({
        preventDefault: preventSpy,
        detail: {
          parts: [new layer.MessagePart("hi")]
        }
      });

      expect(el.conversation).toBe(null);
    });

    it("Should allow modification of conversation, message and notification", function() {
      el.newParticipant = "layer:///identities/howdy"
      el.newMetadata = {howdy: "ho"};
      expect(el.conversation).toBe(null);
      el.addEventListener('layer-create-conversation-and-message', function(evt) {
        var conversation = evt.detail.conversation;
        var message = evt.detail.message;
        var notification = evt.detail.notification;

        conversation.addParticipants(["layer:///identities/newguy"]);
        message.parts[0] = new layer.MessagePart("ho");
        notification.title = "not this again";
      });
      var tmp = layer.Message.prototype.send;
      spyOn(layer.Message.prototype, "send").and.callThrough();
      var preventSpy = jasmine.createSpy("spy");

      el._createConversationAndSendMessage({
        preventDefault: preventSpy,
        detail: {
          parts: [new layer.MessagePart("hi")]
        }
      });

      expect(el.conversation.lastMessage.parts[0].body).toEqual("ho");
      expect(el.conversation.participants).toEqual(jasmine.arrayContaining([
        client.user,
        client.getIdentity("layer:///identities/newguy"),
        client.getIdentity("layer:///identities/howdy")
      ]));
      expect(el.conversation.lastMessage.parts.length).toEqual(1);
      expect(el.conversation.lastMessage.send).toHaveBeenCalledWith(jasmine.objectContaining({
        title: "not this again"
      }));

      // Restore
      layer.Message.prototype.send = tmp;
    });
  });

  describe("The toggleOpen() method", function() {
    it("Should toggle the isDialogShowing property", function() {
      expect(el.isDialogShowing).toBe(false);
      el.toggleOpen();
      expect(el.isDialogShowing).toBe(true);
      el.toggleOpen();
      expect(el.isDialogShowing).toBe(false);
    });
  });

  describe("The _updateUnread() method", function() {
    it("Should detect if any conversations have unread messages", function() {
      var c2 = client.createConversation({
        participants: ["z"]
      });
      el.query.data = [conversation, c2];

      conversation.lastMessage = c2.lastMessage = null;
      el._updateUnread();
      expect(el.nodes.floatingButton.hasUnread).toBe(false);

      c2.lastMessage = conversation.createMessage("hey");
      c2.lastMessage.isRead = false;
      el._updateUnread();
      expect(el.nodes.floatingButton.hasUnread).toBe(true);

      c2.lastMessage.isRead = true;
      el._updateUnread();
      expect(el.nodes.floatingButton.hasUnread).toBe(false);
    });
  });
});