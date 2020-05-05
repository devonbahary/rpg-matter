//-----------------------------------------------------------------------------
// Game_Event
//
// The game object class for an event. It contains functionality for event page
// switching and running parallel process events.

import { BODY_LABELS } from "../constants";

const EVENT_TRIGGERS = {
    actionButton: 0,
    playerTouch: 1,
    eventTouch: 2,
    autoRun: 3,
    parallel: 4,
};

Game_Event.prototype.onCollisionStart = function(event) {
    if (event.pair.label !== BODY_LABELS.PLAYER) return;
        
    if (this.isTriggerIn([ EVENT_TRIGGERS.playerTouch, EVENT_TRIGGERS.eventTouch ])) {
        this.start();
    }
};