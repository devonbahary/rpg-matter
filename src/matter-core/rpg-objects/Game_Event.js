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

const UNACTIONABLE_EVENT_COMMAND_CODES = [ 
    EVENT_COMMAND_CODES.NULL,
    EVENT_COMMAND_CODES.COMMENT,
    EVENT_COMMAND_CODES.COMMENT_CTD,
];


Object.defineProperties(Game_CharacterBase.prototype, {
    _pageMass: { get: function() { 
        if (parseInt(this._pageMeta.mass)) return parseInt(this._pageMeta.mass);
        else if (this._pageMeta.mass) return MATTER_CORE.CHARACTER_MASSES[this._pageMeta.mass.trim()];
        return null;
    }, configurable: false },
    isActionEvent: { get: function() { return this.isTriggerIn([ EVENT_TRIGGERS.ACTION_BUTTON ]); }, configurable: false },
    isErased: { get: function() { return this._erased; }, configurable: false },
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

const _Game_Event_clearPageSettings = Game_Event.prototype.clearPageSettings;
Game_Event.prototype.clearPageSettings = function() {
    _Game_Event_clearPageSettings.call(this);
    this.clearPageMeta();
};

const _Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function() {
    _Game_Event_setupPageSettings.call(this);
    this.setupPageMeta();
    this.setupPageProperties();
};

Game_Event.prototype.setupPageProperties = function() {
    if (this._pageMass) this.setMass(this._pageMass);
    else this.setStatic(true);
};

const _Game_Event_update = Game_Event.prototype.update;
Game_Event.prototype.update = function() {
    _Game_Event_update.call(this);
    if (this._touchEventCooldown) this._touchEventCooldown--;
};

Game_Event.prototype.hasListContent = function() {
    var list = this.list();
    return list && list.filter(command => !UNACTIONABLE_EVENT_COMMAND_CODES.includes(command.code)).length > 0;
};

const _Game_Event_start = Game_Event.prototype.start;
Game_Event.prototype.start = function() {
    if (!this.hasListContent()) return;
    _Game_Event_start.call(this);
};

Game_Event.prototype.pageComments = function() {
    return this.list().reduce((acc, { code, parameters }) => {
        if ([ EVENT_COMMAND_CODES.COMMENT, EVENT_COMMAND_CODES.COMMENT_CTD ].includes(code)) {
            acc.push(parameters[0]);
        }
        return acc;
    }, []);
};

Game_Event.prototype.setupPageMeta = function() {
    this._pageMeta = this.pageComments().reduce((meta, comment) => {
        const metaMatch = comment.match(/<(\w+):([\w\s\.]+)/i);
        if (metaMatch) {
            const prop = metaMatch[1];
            const value = metaMatch[2];
            meta[prop] = value;
        }
        return meta;
    }, {});
};

Game_Event.prototype.clearPageMeta = function() {
    this._pageMeta = {};
};