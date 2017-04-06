describe("Conversation List Tab", function() {

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
    el = document.createElement('layer-customer-list');
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

  it("Should forward the query and selectedId properties", function() {
    var q = client.createQuery({model: layer.Query.Message});
    el.query = q;
    expect(el.nodes.listPanel.query).toBe(q);

    el.selectedId = "layer:///conversations/fred";
    expect(el.nodes.listPanel.selectedId).toEqual("layer:///conversations/fred");
    expect(el.selectedId).toEqual("layer:///conversations/fred");
  });

  describe("The resolvedTest property", function() {
    it("Should set the listPanel filter if the filterMode is open", function() {
      var called = false;
      el.resolvedTest = function(c) {
        called = true;
        expect(conversation).toBe(c);
        return true;
      };
      expect(el.filterMode).toEqual("open");

      called = false;
      el.nodes.listPanel.filter(conversation);
      expect(called).toBe(true);
    });

    it("Should clear the listPanel filter", function() {
      el.filterMode = "all";
      el.nodes.listPanel.filter = function() {};
      el.resolvedTest = function() {};
      expect(el.nodes.listPanel.filter).toBe(null);
    });
  });

  describe("The filterMode property", function() {
    it("Should setup or clear the listPanel filter if set to open", function() {
      el.filterMode = "open2";// not a valid value but insures change will fire
      el.properties.resolvedTest = function() {return true;};
      el.nodes.listPanel.filter = null;
      el.filterMode = "open";
      expect(el.nodes.listPanel.filter).not.toBe(null);

      el.filterMode = "open2"; // not a valid value but insures change will fire
      el.properties.resolvedTest = null;
      el.filterMode = "open";
      expect(el.nodes.listPanel.filter).toBe(null);
    });

    it("Should clear the listPanel filter if set to all", function() {
      el.nodes.listPanel.filter = function() {};
      el.filterMode = "all";
      expect(el.nodes.listPanel.filter).toBe(null);
    });

    it("Should toggle the button classes", function() {
      el.filterMode = "open2";
      el.filterMode = "open";
      expect(el.nodes.filterAllButton.classList.contains('layer-toggle-selected')).toBe(false);
      expect(el.nodes.filterOpenButton.classList.contains('layer-toggle-selected')).toBe(true);

      el.filterMode = "all";
      expect(el.nodes.filterAllButton.classList.contains('layer-toggle-selected')).toBe(true);
      expect(el.nodes.filterOpenButton.classList.contains('layer-toggle-selected')).toBe(false);
    });
  });

  describe("The isNavigateToResolvedEnabled property", function() {
    it("Should toggle classes", function() {
      el.isNavigateToResolvedEnabled = false;
      expect(el.classList.contains('layer-list-filter-toggles-enabled')).toBe(false);

      el.isNavigateToResolvedEnabled = true;
      expect(el.classList.contains('layer-list-filter-toggles-enabled')).toBe(true);
    });
  });

  describe("The showCurrentLabel and showAllLabel property", function() {
    it("Should update the button html", function() {
      el.showCurrentLabel = "AAAA";
      expect(el.nodes.filterOpenButton.innerHTML).toEqual("AAAA");
      el.showAllLabel = "BBBB";
      expect(el.nodes.filterAllButton.innerHTML).toEqual("BBBB");
    });
  });

  describe("The title property", function() {
    it("Should update the title html", function() {
      el.title = "I am a title. Sort of.";
      expect(el.nodes.titleText.innerHTML).toEqual("I am a title. Sort of.");
    });
  });

  describe("The onCreate() method", function() {
    it("Should wire up the button click events", function() {
      el.filterMode = "open2";

      el.nodes.filterAllButton.click();
      expect(el.filterMode).toEqual("all");

      el.nodes.filterOpenButton.click();
      expect(el.filterMode).toEqual("open");
    });

    it("Should wire up the listPanel onRenderListItem property", function() {
      spyOn(el, "resolvedTest");
      var conversationItem = document.createElement("layer-conversation-item");
      conversationItem.item = conversation;
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      el.nodes.listPanel.onRenderListItem(conversationItem);
      expect(el.resolvedTest).toHaveBeenCalledWith(conversation);
    });
  });

  describe("The onRenderItem() method", function() {
    it("Should remove layer-conversation-resolved from unresolved conversations", function() {
      var query = client.createQuery({model: layer.Query.Conversation});
      query.data = [conversation, client.createConversation({participants: ["z"]})];
      el.properties.resolvedTest = function() {return false;}
      el.query = query;
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      var children = el.querySelectorAll("layer-conversation-item");
      expect(children.length).toEqual(2);
      var resolvedNode1 = document.createElement("i");
      var resolvedNode2 = document.createElement("i");
      resolvedNode1.classList.add("layer-conversation-resolved");
      resolvedNode2.classList.add("layer-conversation-resolved");
      children[0].appendChild(resolvedNode1);
      children[1].appendChild(resolvedNode2);

      el.onRenderItem(children[0]);
      el.onRenderItem(children[1]);

      expect(children[0].classList.contains("layer-conversation-resolved")).toBe(false);
      expect(children[1].classList.contains("layer-conversation-resolved")).toBe(false);
    });

    it("Should add layer-conversation-resolved to resolved conversations", function() {
      var query = client.createQuery({model: layer.Query.Conversation});
      query.data = [conversation, client.createConversation({participants: ["z"]})];      el.query = query;
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      var children = el.querySelectorAll("layer-conversation-item");
      expect(children.length).toEqual(2);
      children[0].classList.remove("layer-conversation-resolved");
      children[1].classList.remove("layer-conversation-resolved");

      el.resolvedTest = function() {return true;}

      el.onRenderItem(children[0]);
      el.onRenderItem(children[1]);

      expect(children[0].querySelector(".layer-conversation-resolved").tagName).toEqual("I");
      expect(children[1].querySelector(".layer-conversation-resolved").tagName).toEqual("I");
    });
  });

  describe("The onKeyDown() method", function() {
    it("Should focus text", function() {
      spyOn(el.nodes.listComposer, "focus");
      el.onKeyDown();
      expect(el.nodes.listComposer.focus).toHaveBeenCalled();
    });
  });

  describe("The _changeFilter() method", function() {
    it("Should toggle the filterMode based on which button was clicked", function() {
      el.filterMode = "open2";

      el.nodes.filterAllButton.click();
      expect(el.filterMode).toEqual("all");

      el.nodes.filterOpenButton.click();
      expect(el.filterMode).toEqual("open");
    });
  });
});