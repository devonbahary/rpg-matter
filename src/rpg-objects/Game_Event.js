//-----------------------------------------------------------------------------
// Game_Event
//
// The game object class for an event. It contains functionality for event page
// switching and running parallel process events.

import { BODY_LABELS } from "../constants";

const EVENT_TRIGGERS = {
    ACTION_BUTTON: 0,
    PLAYER_TOUCH: 1,
    EVENT_TOUCH: 2,
    AUTO_RUN: 3,
    PARALLEL: 4,
};

Game_Event.prototype.onCollisionStart = function(event) {
    if (event.pair.label !== BODY_LABELS.PLAYER) return;
        
    if (this.isTriggerIn([ EVENT_TRIGGERS.PLAYER_TOUCH, EVENT_TRIGGERS.EVENT_TOUCH ])) {
        this.start();
    }
};