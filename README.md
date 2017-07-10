# layer-ui-web-customer-widget

Pre-built widgets to allow customers to talk to your staff from your web site

## Goals

Build a widget that allows customers to talk to the web-site's staff.  This does not dictate whether such discussions
are sales, support, advice or other in nature, just that there is a conversation that is not the core task of your site, but
can be easily accessed within your site.

This project does *not* contain any implementation of what the staff will see, only what the customer sees.


## Philosophy

This project should be loadable via CDN or NPM.

Few customers will use this project as-is; the experience must be customizable to each use case.

Customization can be done using the following tools:

1. Properties are exposed on the top level widgets that provide the common customizations that are needed.
   These properties can be modified via html or javascript by setting attributes/properties.
1. Before taking any significant action, an event is triggered; this event can be used to prevent the
   default behavior and let the app provide a custom behavior.
1. Components can be customized by providing `mixins` to customize the widget as documented within `layer-ui-web`.
1. The entire project may be treated as a template; copied, and modified to suit the customer's needs.

## Widgets

This repository comes with two main widgets:

* `<layer-customer-single-conversation />`: This widget assumes that the user only has a single long running conversation with your staff.
    * For use cases where you have an ongoing discussion about various issues, that may involve one or more staff members over time
* `<layer-customer-multiple-conversation />`: This widget assumes that the user has multiple conversations with your staff
    * Each support ticket is a separate conversation (good for zendesk integration for example)
    * Each sale is a separate conversation
    * Each topic is a separate conversation
    * Each staff member has a separate conversation with your customer

## Installation

Understanding how to use this widget will be easier if you first understand the underlying UI framework.  This widget
is built on top of Layer UI for Web, which is built using Webcomponents.  Layer UI for Web provides Adapters that can be used
to easily add support for these widgets to a React, Backbone or Angular application.

You can read more about how these adapters work at https://docs.layer.com/sdk/webui/ui_introduction.

### CDN

Not yet available

### NPM

Not yet available

### Github

#### Running the Sample

1. `git clone git@github.com:layerhq/layer-ui-web-customer-widget.git`
1. `npm install`
1. `grunt build`
1. Copy your LayerConfiguration.json file from your quickstart demo application that was generated for you from the Developer Dashboard; this goes in the root folder
1. start a simple webserver that can serve simple files
1. Load `single-conversation-demo.html` or `multiple-conversation-demo.html`

#### Adding to your App

It should be something like this, but there are probably some issues around `npm install` that need to be worked out.
Especially insure that you don't get multiple copies of npm repos; one in `node_modules` and another in `node_modules/layer-ui-web-customer-widget/node_modules`.

1. `git clone git@github.com:layerhq/layer-ui-web-customer-widget.git`
1. `mv layer-ui-web-customer-widget myproject/node_modules`
1. Import the library using either:
    * `import 'layer-ui-web-customer-widget/lib-es5/layer-customer-single-conversation/layer-customer-single-conversation'`
    * `import 'layer-ui-web-customer-widget/lib-es5/layer-customer-multiple-conversation/layer-customer-multiple-conversation'`
    * You may also import from `lib-es6` if you prefer to have es6 code as your input.

## Usage

Note that before you can use any widgets, you must create a layer.Client, and typically would start authentication on that client by calling `client.connect()`.

### Raw HTML/Javascript

The two demos included in this repository [single-conversation-demo.html] and [multiple-conversation-demo.html] show how the raw javascript/html approach can be used:

```
<script>
// Standard layer.Client initialization:
var client = new layer.Client({
    appId: 'layer:///apps/staging/1d980162-c5ee-11e5-bb69-e08c0300541f'
});
client.on('challenge', function(evt) {
    myGetIdentityToken(client.appId, myUserId, evt.nonce, evt.callback);
});
client.connect();

// Standard initialization of the Layer UI framework; this will also initialize any widgets defined by this repository.
layerUI.init({
    appId: 'layer:///apps/staging/1d980162-c5ee-11e5-bb69-e08c0300541f',
});
</script>
<body>
    <layer-customer-single-conversation conversation-participants='customer-support-person-3' conversation-metadata='{"conversationName": "Help me..."}'></layer-customer-single-conversation>
</body>
```

### React Adapter

```javascript
import LayerUI from 'layer-ui-web';
import 'layer-ui-web-customer-widget/lib-es5/layer-customer-single-conversation/layer-customer-single-conversation';

LayerUI.init({ appId: myAppId });

const { CustomerSingleConversation, CustomerMultipleConversation } = LayerUI.adapters.react();

...

render() {
    return <CustomerSingleConversation
        conversationParticipants='customer-support-person-3, customer-support-person-4'
        conversationMetadata={{conversationName: "Help me..."}}>
        </CustomerSingleConversation>;
}
```

### Angular 1.5 Adapter

```javascript
import LayerUI from 'layer-ui-web'
import 'layer-ui-web-customer-widget/lib-es5/layer-customer-single-conversation/layer-customer-single-conversation';
LayerUI.init({ appId: 'layer:///apps/staging/UUID' });

layerUI.adapters.angular(angular); // Creates the layerUIControllers controller
angular.module('MyApp', ['layerUIControllers']);
```

The above code initializes angular 1.x Directives which will be part of the “layerUIControllers” controller, and allows the following template to
load the widgets of this repository:

```html
<layer-customer-single-conversation ng-conversation-participants='customer-support-person-3' ng-conversation-metadata='{"conversationName": "Help me..."}'></layer-customer-single-conversation>
```

### Backbone Adapter

```javascript
import LayerUI from 'layer-ui-web';
import 'layer-ui-web-customer-widget/lib-es5/layer-customer-single-conversation/layer-customer-single-conversation';

LayerUI.init({ appId: myAppId });

const { CustomerSingleConversation, CustomerMultipleConversation } = LayerUI.backbone.react();

const singleConversationView = new CustomerSingleConversation(client);
```

## Configuring the Widgets

The following properties need to be configured for your widget:

* `welcomeNodes`:   Pass in an HTML Element (`<div />` for example) that contains all of your welcome message HTML,
                    including optionally any interactive elements you need there.
* `conversationParticipants`: Pass in a string identifying the User ID of the staff member that this user will create a conversation with. This can be a comma separated list of IDs.
* `conversationMetadata`:    Pass in an object with any initial metadata that the conversation should be created with.

These properties can be changed at runtime, as needed.

These properties may be configured but are optional:

* `composeButtons`:     HTMLElements (buttons) to show next to the Composer in the Chat View
* `composeButtonsLeft`: HTMLElements (buttons) to show left of the Composer in the Chat View

CustomerSingleConversation widget Only Properties:

* `title`: Set the title of the Chat View

CustomerMultipleConversation widget Only Properties:

* `resolvedTest`:                  A function that tests to see if a Conversation is resolved/complete;
                                   typically a completed conversation is not rendered.
* `isNavigateToResolvedEnabled`    Boolean to enable/disable switching the Conversation List between Open and All conversations
                                   (Open == unresolved/incomplete)
* `showAllLabel`                   Text to show on button to set the filter to show All Conversations in the Conversation List
* `showCurrentLabel`               Text to show on button to set the filter to show Open Conversations in the Conversation List
* `listTitle`                      Text for the Conversation List title
* `chatTitleCallback`              Function to set the Chat View Title

Finally, the following properties can be used to more directly control the widgets; these are not used for configuration, but rather, for control:

* `isDialogShowing`:               Set to `true` to show the dialog, `false` to hide the dialog
* `conversation`                   Set this to any `layer.Conversation` to transition to the Chat View so the user can
                                   start talking within this Conversation.

More information about all of these docs can be viewed in the API reference.  You can generate this reference by:

1. `git clone git@github.com:layerhq/layer-ui-web-customer-widget.git`
1. `cd layer-ui-web-customer-widget`
1. `npm install`
1. `grunt docs`
1. `open docs/index.html`

