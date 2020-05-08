//=============================================================================
// MatterActionEvent
//=============================================================================

/*:
 * @plugindesc Adds sprite visualization for action button Game_Events
 * Requires MatterCore.js plugin.
 * 
 * @help
 * Adds a hovering icon above Game_Events with an action button trigger and event 
 * commands to indicate interaction.
 * 
 * @param Icon Index
 * @desc Icon index to display above events.
 * @type number
 * @min 0
 * @default 4
 * 
 * @param Icon Width
 * @desc Width (in pixels) of the icon.
 * @type number
 * @min 1
 * @default 32
 * 
 * @param Icon Height
 * @desc Height (in pixels) of the icon.
 * @type number
 * @min 1
 * @default 32
 * 
 * @param Animation Duration
 * @desc Duration (in frames) for the icon hovering to cycle once (1-600). 
 * @type number
 * @min 1
 * @max 600
 * @default 60
 * 
 * @param Animation Peak Height
 * @desc Peak height (in pixels) of the icon hover animation above the Sprite_Character.
 * @type number
 * @min 0
 * @default 10
 * 
 * @param Opacity Targeted
 * @desc Opacity of the icon when it's Game_Event is the target of an action button (0-255).
 * @type number
 * @min 0
 * @max 255
 * @default 255
 * 
 * @param Opacity Untargeted
 * @desc Opacity of the icon when it's Game_Event is not the target of an action button (0-255).
 * @type number
 * @min 0
 * @max 255
 * @default 100
*/

import { EVENT_TRIGGERS } from "../common/constants";

const ICON_INDEX = parseInt(PluginManager.parameters('MatterActionEvent')["Icon Index"]);
const ICON_WIDTH = parseInt(PluginManager.parameters('MatterActionEvent')["Icon Width"]);
const ICON_HEIGHT = parseInt(PluginManager.parameters('MatterActionEvent')["Icon Height"]);
const ANIMATION_DURATION = parseInt(PluginManager.parameters('MatterActionEvent')["Animation Duration"]);
const PEAK_HEIGHT = parseInt(PluginManager.parameters('MatterActionEvent')["Animation Peak Height"]);
const OPACITY_TARGETED = parseInt(PluginManager.parameters('MatterActionEvent')["Opacity Targeted"]);
const OPACITY_UNTARGETED = parseInt(PluginManager.parameters('MatterActionEvent')["Opacity Untargeted"]);

/*
    TODO:
        - slow opacity fade when should no longer display
        - Event-specific icons
            - parse for number -> use icon_index
            - if string -> use as category (perhaps where category:icon_index map is defined in plugin param?)
*/

//-----------------------------------------------------------------------------
// Game_Character
//
// The superclass of Game_Player, Game_Follower, GameVehicle, and Game_Event.

Game_Character.prototype.spriteActionEventIconIndex = function() {
    return 0;
};

//-----------------------------------------------------------------------------
// Game_Event
//
// The game object class for an event. It contains functionality for event page
// switching and running parallel process events.

Game_Event.prototype.hasListContent = function() {
    var list = this.list();
    return list && list.length > 1;
};

Game_Event.prototype.spriteActionEventIconIndex = function() {
    return ICON_INDEX; // TODO: read from event page
};

//-----------------------------------------------------------------------------
// SpriteActionEvent
//
// The sprite for displaying icons above Game_Events with action button trigger.

function Sprite_ActionEvent() {
    this.initialize.apply(this, arguments);
}

Sprite_ActionEvent.prototype = Object.create(Sprite_Base.prototype);
Sprite_ActionEvent.prototype.constructor = Sprite_ActionEvent;

Sprite_ActionEvent.prototype.initialize = function(character) {
    Sprite_Base.prototype.initialize.call(this);
    this.initMembers();
    this.setCharacter(character);
};

Sprite_ActionEvent.prototype.initMembers = function() {
    this._iconIndex = 0;
    this._animationCount = 0;
    this.anchor.x = 0.5;
    this.anchor.y = 1;
    this._isShowing = false;
};

Sprite_ActionEvent.prototype.setCharacter = function(character) {
    this._character = character;
};

Sprite_ActionEvent.prototype.loadBitmap = function() {
    this.bitmap = ImageManager.loadSystem('IconSet');
    var pw = ICON_WIDTH;
    var ph = ICON_HEIGHT;
    var sx = this._iconIndex % 16 * pw;
    var sy = Math.floor(this._iconIndex / 16) * ph;
    this.setFrame(sx, sy, pw, ph);
};

Sprite_ActionEvent.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    this.updateAnimationCount();
    if (this.isCharacterActionButtonEvent()) {
        this.updateForActionButtonEvent();
    } else {
        this.updateForNonActionButtonEvent();
    }
    this.updateIconIndex();
};

Sprite_ActionEvent.prototype.isCharacterActionButtonEvent = function() {
    return (
        this._character instanceof Game_Event && 
        this._character.hasListContent() && 
        this._character.isTriggerIn([ EVENT_TRIGGERS.ACTION_BUTTON ])
    );
};

Sprite_ActionEvent.prototype.updateForActionButtonEvent = function() {
    if (!this._isShowing) {
        this.loadBitmap();
        this._isShowing = true;
    }
    this.updatePosition();
    this.opacity = this.opacityThisFrame();
};

Sprite_ActionEvent.prototype.updateForNonActionButtonEvent = function() {
    if (this._isShowing) {
        this.bitmap.clear();
        this._isShowing = false;
    }
};

Sprite_ActionEvent.prototype.updateAnimationCount = function() {
    this._animationCount++;
    if (this._animationCount >= ANIMATION_DURATION) {
        this._animationCount = 0;
    }
};

Sprite_ActionEvent.prototype.updatePosition = function() {
    const animationY = this.progressTowardsAnimation() * PEAK_HEIGHT;
    this.y = -(this.parent.height + animationY);
};

Sprite_ActionEvent.prototype.updateIconIndex = function() {
    const characterIconIndex = this._character.spriteActionEventIconIndex();
    if (this._iconIndex !== characterIconIndex) {
        this._iconIndex = characterIconIndex;
        this.loadBitmap();
    }
};

Sprite_ActionEvent.prototype.progressTowardsAnimation = function() {
    const framesInOneDirection = ANIMATION_DURATION / 2;
    if (this._animationCount <= Math.floor(framesInOneDirection)) {
        return this._animationCount / framesInOneDirection;
    } else {
        return (ANIMATION_DURATION - this._animationCount) / framesInOneDirection;
    }
};

Sprite_ActionEvent.prototype.opacityThisFrame = function() {
    if (this.isCharacterTargeted()) return OPACITY_TARGETED;
    return OPACITY_UNTARGETED;
};

Sprite_ActionEvent.prototype.isCharacterTargeted = function() {
    return $gamePlayer.closestActionButtonEventInRange() === this._character;
};

//-----------------------------------------------------------------------------
// Sprite_Character
//
// The sprite for displaying a character.

const _Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
Sprite_Character.prototype.initMembers = function() {
    _Sprite_Character_initMembers.call(this);
    this._spriteActionEvent = new Sprite_ActionEvent(this._character);
    this.addChild(this._spriteActionEvent);
};

const _Sprite_Character_setCharacter = Sprite_Character.prototype.setCharacter;
Sprite_Character.prototype.setCharacter = function(character) {
    _Sprite_Character_setCharacter.call(this, character);
    this._spriteActionEvent.setCharacter(character);
};
