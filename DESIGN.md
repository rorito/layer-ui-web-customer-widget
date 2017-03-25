# Features

### Key Configurations:

1. Does the chat system want to have a single long running conversation between the customer and the organization,
   and each time they come back, to continue with that single conversation?  In this scenario,
   there would typically only ever be a single Conversation.  Refered in this doc as `SingleConversationStrategy`
1. Does the chat system create one Conversation per "issue", "sale", "whatnot", potentially allowing
   there to be multiple active Conversations, as well as past Conversations that are marked as "resolved/complete"
   Refered in this doc as `ResolvableConversationStrategy`
1. What behaviors should be followed on receiving a new message while the page has focus, but the chat UI is closed?
    * Default would be to open the Conversational Chat Screen
    * Alternative is to light up the Floating Chat Icon
1. What behaviors should be followed on receiving a new message while the page is in the background?
    * Desktop Notifications?
    * Flash the titlebar?
    * Open the Conversational Chat Screen (if not already open)?
    * Light up the Floating Chat Icon?

### The Floating Chat Icon

The floating chat icon indicates if there are messages for you, and can be clicked at any time to open up the Conversational Interface.

The floating chat icon turns into a close icon for closing the Conversational Interface (Assumes that interface is a dialog)

For `SingleConversationStrategy`, clicking the Chat Icon means:

1. If there is a Conversation, open it in the Conversational Chat Screen
1. If there is not a Conversation, open the Conversational Interface Welcome Screen

For `ResolvableConversationStrategy`, clicking the Chat Icon must be configured:

1. If there are no unresolved Conversations, open the Conversational Interface Welcome Screen
1. If there is one unresolved Conversation, Config Options:
    * it should open that one Conversation
    * It should open a Conversation List, which may _also_ allow for creating a new "ticket"
    * It should always open the Welcome Screen
    * STATUS: Currently always goes to the Conversation List. Unclear if other options are worth supporting.
1. If there are multiple unresolved Conversations, Config Options:
    * it should open the most recently active unresolved conversation
    * It should open a Conversation List, which may _also_ allow for creating a new "ticket"
    * It should always open the Welcome Screen
    * STATUS: Currently always goes to the Conversation List. Unclear if other options are worth supporting.

### Conversational Interface Welcome Screen

Assume that the Conversational Interface is in a Dialog; other options are future work.

Welcome screen consists of a welcome message consisting of completely arbitrary HTML, and a Compose bar for typing in a Message.

Welcome screen may have optional link to a list of past Conversations if using the `ResolvableConversationStrategy`.

Sending a Message transitions to the Conversational Chat Screen

CONFIGURATIONS:

1. Custom HTML to show above the composer
1. What User ID is the conversation created with
1. What parameters should be used in creating the Conversation (metadata, tags, title, etc...)
1. If there are past resolved conversations, should the user be able to navigate to these?  If there are past unresolved conversations,
   should the user be able to navigate to these?

STATUS:

* DONE

### Conversational Chat Screen

Typically this is a one-on-one between customer and staff (though nothing says more staff couldn't join the conversation).

There are minor configurations around title bars and controls here, but nothing particularly critical.

For the `ResolvableConversationStrategy` there would be a link to the Conversation List.

Support for Cards may require customization of the Compose Bar to support custom buttons.

STATUS:

* DONE

### Conversation List

This view only exists for the `ResolvableConversationStrategy` and consists of:

1. Some sort of title.  "Buying a Dishwasher"; "Chat with Ron"; "Authentication errors"
1. Some sort of status or status icon "resolved/complete" "unresolved/in-progress", and perhaps "expired" for sessions that were not resolved, but can't reasonably be considered to be in-progress.  Or maybe stick to "complete"
1. Last Message text
1. "New Issue" button for starting a new topic/conversation (optional)

STATUS:

* Find all events that app may want to customize/cancel

FUTURE WORK:

* Get real icons, remove Font Awesome icons which are bulky on resources
