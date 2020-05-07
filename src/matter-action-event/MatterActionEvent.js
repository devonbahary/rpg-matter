//=============================================================================
// MatterActionEvent
//=============================================================================

/*:
 * @plugindesc Adds sprite visualization for action button Game_Events.
 * Requires MatterCore.js plugin.
 * 
*/

import { EVENT_TRIGGERS } from "../common/constants";


//-----------------------------------------------------------------------------
// Game_Event
//
// The game object class for an event. It contains functionality for event page
// switching and running parallel process events.

Game_Event.prototype.hasListContent = function() {
    var list = this.list();
    return list && list.length > 1;
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

Sprite_ActionEvent._defaultIconIndex = 1;
Sprite_ActionEvent._framesInAnimation = 60;
Sprite_ActionEvent._peakHeightInAnimation = 10;
Sprite_ActionEvent._actionEventTargetOpacity = 255;
Sprite_ActionEvent._actionEventNonTargetOpacity = 100;

Sprite_ActionEvent.prototype.initMembers = function() {
    this._iconIndex = Sprite_ActionEvent._defaultIconIndex;
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
    var pw = Sprite_StateIcon._iconWidth;
    var ph = Sprite_StateIcon._iconHeight;
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
    this.updateOpacity();
};

Sprite_ActionEvent.prototype.updateForNonActionButtonEvent = function() {
    if (this._isShowing) {
        this.bitmap.clear();
        this._isShowing = false;
    }
};

Sprite_ActionEvent.prototype.updateAnimationCount = function() {
    this._animationCount++;
    if (this._animationCount >= Sprite_ActionEvent._framesInAnimation) {
        this._animationCount = 0;
    }
};

Sprite_ActionEvent.prototype.updatePosition = function() {
    const animationY = this.progressTowardsAnimation() * Sprite_ActionEvent._peakHeightInAnimation;
    this.y = -(this.parent.height + animationY);
};

Sprite_ActionEvent.prototype.progressTowardsAnimation = function() {
    const framesInOneDirection = Sprite_ActionEvent._framesInAnimation / 2;
    if (this._animationCount <= Math.floor(framesInOneDirection)) {
        return this._animationCount / framesInOneDirection;
    } else {
        return (Sprite_ActionEvent._framesInAnimation - this._animationCount) / framesInOneDirection;
    }
};

Sprite_ActionEvent.prototype.updateOpacity = function() {
    if ($gameMap.isEventRunning()) {
        this.opacity = 0;
    } else {
        const isClosestActionButtonEvent = $gamePlayer.closestActionButtonEventInRange() === this._character;
        this.opacity = isClosestActionButtonEvent ? Sprite_ActionEvent._actionEventTargetOpacity : Sprite_ActionEvent._actionEventNonTargetOpacity;
    }
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
