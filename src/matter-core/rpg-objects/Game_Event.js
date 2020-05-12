//-----------------------------------------------------------------------------
// Game_Event
//
// The game object class for an event. It contains functionality for event page
// switching and running parallel process events.

import { Events } from "matter-js";
import { BODY_LABELS } from "../constants";
import { EVENT_TRIGGERS } from "../../common/constants";

const BODY_EVENTS = {
    PLAYER_TOUCH: 'playerTouch',
};

Object.defineProperties(Game_CharacterBase.prototype, {
    isActionEvent: { get: function() { return this.isTriggerIn([ EVENT_TRIGGERS.ACTION_BUTTON ]); }, configurable: false },
});

Game_Event.prototype.initCharacterBodyOptions = function() {
    return {
        label: BODY_LABELS.EVENT,
    };
};

Game_Event.prototype.initBodyOptions = function() {
    return {
        ...Game_Character.prototype.initBodyOptions(),
        isStatic: true,
    };
};

Game_Event.prototype.setupMatterEvents = function() {
    Game_Character.prototype.setupMatterEvents.call(this);
    Events.on(this.body, BODY_EVENTS.PLAYER_TOUCH, this.onPlayerTouch.bind(this));  
};

Game_Event.prototype.onCollisionStart = function(event) {
    Game_Character.prototype.onCollisionStart.call(this, event);
    if (event.pair.label == BODY_LABELS.PLAYER) Events.trigger(this.body, BODY_EVENTS.PLAYER_TOUCH, event)
};

Game_Event.prototype.onPlayerTouch = function(event) {
    if (this.isTriggerIn([ EVENT_TRIGGERS.PLAYER_TOUCH, EVENT_TRIGGERS.EVENT_TOUCH ])) {
        this.start();
    }
};