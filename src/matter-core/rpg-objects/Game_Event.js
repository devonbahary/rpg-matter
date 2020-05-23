//-----------------------------------------------------------------------------
// Game_Event
//
// The game object class for an event. It contains functionality for event page
// switching and running parallel process events.

import { Events } from "matter-js";
import { BODY_LABELS, EVENT_COMMAND_CODES, EVENT_TRIGGERS } from "../constants";
import MATTER_CORE from "../pluginParams";

const BODY_EVENTS = {
    PLAYER_TOUCH: 'playerTouch',
};

Object.defineProperties(Game_CharacterBase.prototype, {
    isActionEvent: { get: function() { return this.isTriggerIn([ EVENT_TRIGGERS.ACTION_BUTTON ]); }, configurable: false },
});

const _Game_Event_initMembers = Game_Event.prototype.initMembers;
Game_Event.prototype.initMembers = function() {
    _Game_Event_initMembers.call(this);
    this._touchEventCooldown = 0;
};

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
    if (this.isTouchEvent() && this.isTouchEventCooldownReady()) {
        this.start();
        this._touchEventCooldown = MATTER_CORE.EVENT_TOUCH_COOLDOWN;
    }
};

Game_Event.prototype.isTouchEvent = function() {
    return this.isTriggerIn([ EVENT_TRIGGERS.PLAYER_TOUCH, EVENT_TRIGGERS.EVENT_TOUCH ]);
};

Game_Event.prototype.isTouchEventCooldownReady = function() {
    return this._touchEventCooldown <= 0;
};

const _Game_Event_update = Game_Event.prototype.update;
Game_Event.prototype.update = function() {
    _Game_Event_update.call(this);
    if (this._touchEventCooldown) this._touchEventCooldown--;
};

Game_Event.prototype.pageComments = function() {
    return this.list().reduce((acc, { code, parameters }) => {
        if ([ EVENT_COMMAND_CODES.COMMENT, EVENT_COMMAND_CODES.COMMENT_CTD ].includes(code)) {
            acc.push(parameters[0]);
        }
        return acc;
    }, []);
};