// NOTE: This only tests where things are different than the single conversation widget
describe("Multiple Conversation Widget", function() {

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
    el = document.createElement('layer-customer-multiple-conversation');
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
      expect(el.nodes.welcomeTab.isOpen).toBe(false);
      expect(el.nodes.listTab.isOpen).toBe(false);
      expect(el.nodes.chatTab.isOpen).toBe(true);
    });

    it("Should show the welcome tab if unset and no conversations", function() {
      el.conversation = conversation;
      el.nodes.chatTab.isOpen = true;

      el.conversation = null;

      expect(el.nodes.chatTab.conversation).toBe(null);
      expect(el.nodes.welcomeTab.isOpen).toBe(true);
      expect(el.nodes.listTab.isOpen).toBe(false);
      expect(el.nodes.chatTab.isOpen).toBe(false);
    });

    it("Should show the list tab if unset and some conversations", function() {
      el.conversation = conversation;
      el.nodes.chatTab.isOpen = true;

      el.query.data = [conversation];
      el.conversation = null;

      expect(el.nodes.chatTab.conversation).toBe(null);
      expect(el.nodes.welcomeTab.isOpen).toBe(false);
      expect(el.nodes.listTab.isOpen).toBe(true);
      expect(el.nodes.chatTab.isOpen).toBe(false);
    });
  });

  describe("The resolvedTest property", function() {
    it("Should set the listTab.resolvedTest", function() {
      var spy = jasmine.createSpy("hi");
      el.resolvedTest = spy;
      expect(el.nodes.listTab.resolvedTest).toBe(spy);
    });

    it("Should have a suitable default function", function() {
      expect(el.resolvedTest(conversation)).toBe(false);
      conversation.setMetadataProperties({resolved: "true"});
      expect(el.resolvedTest(conversation)).toBe(true);
    });
  });

  describe("The isNavigateToResolvedEnabled property", function() {
    it("Should set listTab.isNavigateToResolvedEnabled", function() {
      el.isNavigateToResolvedEnabled = false;
      expect(el.nodes.listTab.isNavigateToResolvedEnabled).toBe(false);
    });

    it("Should default to true", function() {
      expect(el.isNavigateToResolvedEnabled).toBe(true);
    });
  });

  describe("The showAllLabel, showCurrentLabel and listTitle property", function() {
    it("Should set the listTab properties", function() {
      el.showAllLabel = "aaaa";
      el.showCurrentLabel = "bbb";
      el.listTitle = "ccc"
      expect(el.nodes.listTab.showAllLabel).toEqual("aaaa");
      expect(el.nodes.listTab.showCurrentLabel).toEqual("bbb");
      expect(el.nodes.listTab.title).toEqual("ccc");
    });

    it("Should have suitable defaults", function() {
      expect(el.showAllLabel).toEqual("All");
      expect(el.showCurrentLabel).toEqual("Current");
      expect(el.listTitle).toEqual("Your Conversations");
    });
  });

  describe("The chatTitleCallback property", function() {
    it("Should pass this to the chatTab", function() {
      var spy = jasmine.createSpy("hey");
      el.chatTitleCallback = spy;
      expect(el.nodes.chatTab.titleCallback).toBe(spy);
    });
  });

  describe("The onCreate() method", function() {
    it("Should wire up conversation selected event", function() {
      el.query.data = [conversation];
      expect(el.conversation).toBe(null);
      el.trigger("layer-conversation-selected", {
        item: conversation
      });
      expect(el.conversation).toBe(conversation);
    });

    it("Should wire up the back button", function() {
      el.query.data = [conversation];
      el.conversation = conversation;
      el.nodes.welcomeTab.isOpen = true;
      expect(el.nodes.listTab.isOpen).toBe(false);
      el.trigger("layer-back-click");
      expect(el.nodes.listTab.isOpen).toBe(true);
    });
  });

  describe("The showList() method", function() {
    it("Should clear the selected conversation", function() {
      el.query.data = [conversation];
      el.conversation = conversation;
      el.showList();
      expect(el.conversation).toBe(null);
    });
  });
});
