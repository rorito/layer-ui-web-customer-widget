describe("Welcome Tab", function() {

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
    el = document.createElement('layer-customer-welcome');
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

  it("Should set the welcomeNodes", function() {
    var div = document.createElement("div");
    div.innerHTML = "hey<i>there</i>";
    el.welcomeNodes = div;
    expect(el.nodes.welcomeNote.firstChild).toBe(div);

    var div2 = document.createElement("div");
    div2.innerHTML = "howdy<i>there</i>";

    el.welcomeNodes = div2;
    expect(el.nodes.welcomeNote.firstChild).toBe(div2);
    expect(el.nodes.welcomeNote.childNodes.length).toEqual(1);
  });

  it("Should focus on the composer when onKeyDown is called", function() {
    spyOn(el.nodes.welcomeComposer, "focus");
    el.onKeyDown();
    expect(el.nodes.welcomeComposer.focus).toHaveBeenCalledWith();
  });
});