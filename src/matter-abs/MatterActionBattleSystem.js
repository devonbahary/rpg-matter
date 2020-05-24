//=============================================================================
// MatterActionBattleSystem
//=============================================================================

/*:
 * @plugindesc Action Battle System
 * Requires MatterCore.js plugin.
*/

import { battlerFromPage } from "./utils";

export const EVENT_TAG_REGEX_ACTOR_ID = /\<Actor (\d+)\>/i;
export const EVENT_TAG_REGEX_ENEMY_ID = /\<Enemy (\d+)\>/i;


//-----------------------------------------------------------------------------
// Game_Player
//
// The game object class for the player. It contains event starting
// determinants and map scrolling functions.

Object.defineProperties(Game_Player.prototype, {
    battler: { get: function() { return $gameParty.leader(); }, configurable: false },
});

//-----------------------------------------------------------------------------
// Game_Event
//
// The game object class for an event. It contains functionality for event page
// switching and running parallel process events.

const _Game_Event_clearPageSettings = Game_Event.prototype.clearPageSettings;
Game_Event.prototype.clearPageSettings = function() {
    _Game_Event_clearPageSettings.call(this);
    this.battler = null;
};

const _Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function() {
    _Game_Event_setupPageSettings.call(this);
    this.setupBattler();
    /*
        - setImage
        - setDirection
        - setPattern
        - setMoveSpeed (would be handled by battler anyway?)
        - setMoveFrequency
        - setPriorityType
        - setWalkAnime 
        - setStepAnime (stepping enemies are engaged with the user?)
        - setDirectionFix
        - setThrough
        - setMoveRoute (define move pattern based on Game_Enemy?)
        - _moveType ^
        - _trigger (should be none, except maybe for NPC actors?)
        - 
    */
};

Game_Event.prototype.setupBattler = function() {
    const battler = battlerFromPage.call(this);
    if (battler) this.battler = battler;
};


//-----------------------------------------------------------------------------
// Sprite_Character
//
// The sprite for displaying a character.

const _Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
Sprite_Character.prototype.initMembers = function() {
    _Sprite_Character_initMembers.call(this);
    this._spriteBattlerParameters = new Sprite_BattlerParameters(this._character);
    this.addChild(this._spriteBattlerParameters);
};

const _Sprite_Character_setCharacter = Sprite_Character.prototype.setCharacter;
Sprite_Character.prototype.setCharacter = function(character) {
    _Sprite_Character_setCharacter.call(this, character);
    this._spriteBattlerParameters.setCharacter(character);
};

//-----------------------------------------------------------------------------
// Sprite_BattlerParameters
//
// The sprite for displaying overhead battler parameters.


function Sprite_BattlerParameters() {
    this.initialize.apply(this, arguments);
}

Sprite_BattlerParameters.prototype = Object.create(Sprite_Base.prototype);
Sprite_BattlerParameters.prototype.constructor = Sprite_BattlerParameters;

Object.defineProperties(Sprite_BattlerParameters.prototype, {
    _battler: { get: function() { return this._character ? this._character.battler : null; }, configurable: false },
});

Sprite_BattlerParameters.GAUGE_HEIGHT = 4;

Sprite_BattlerParameters.prototype.initialize = function(character) {
    Sprite_Base.prototype.initialize.call(this);
    Window_Base.prototype.loadWindowskin.call(this);
    this.setCharacter(character);
    this.initMembers();
};

Sprite_BattlerParameters.prototype.initMembers = function() {
    this._hpMem = 0;
    this._mhpMem = 0;
};

Sprite_BattlerParameters.prototype.createBitmap = function() {
    var tileWidth = $gameMap.tileWidth();
    this.bitmap = new Bitmap(tileWidth - 4, Sprite_BattlerParameters.GAUGE_HEIGHT);
    this.anchor.x = 0.5;
};

Sprite_BattlerParameters.prototype.setCharacter = function(character) {
    this._character = character;
};

Sprite_BattlerParameters.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    if (this.shouldShow() && !this.bitmap) {
        this.createBitmap();
    } else if (!this.shouldShow() && this.bitmap) {
        this.bitmap.clear();
        this.bitmap = null;
    } else if (this.shouldShow()) {
        this.updateGauge();
        this.updatePosition();
    }
};

Sprite_BattlerParameters.prototype.shouldShow = function() {
    return this._battler;
};

Sprite_BattlerParameters.prototype.updateGauge = function() {
    if (this._battler.hp !== this._hpMem || this._battler.mhp !== this._mhpMem) {
        this._hpMem = this._battler.hp;
        this._mhpMem = this._battler.mhp;
        
        const color1 = this.hpGaugeColor1();
        const color2 = this.hpGaugeColor2();
        const fillW = (this.width - 2) * this._battler.hpRate();
        this.bitmap.clear();
        this.bitmap.fillAll(Window_Base.prototype.gaugeBackColor.call(this));
        this.bitmap.gradientFillRect(1, 1, fillW, Sprite_BattlerParameters.GAUGE_HEIGHT - 2, color1, color2)
    }
};

Sprite_BattlerParameters.prototype.updatePosition = function() {
    this.y = -(this.parent.height + this.height);
};

Sprite_BattlerParameters.prototype.textColor = function(n) {
    return Window_Base.prototype.textColor.call(this, n);
};

Sprite_BattlerParameters.prototype.hpGaugeColor1 = function() {
    return Window_Base.prototype.hpGaugeColor1.call(this);
};

Sprite_BattlerParameters.prototype.hpGaugeColor2 = function() {
    return Window_Base.prototype.hpGaugeColor2.call(this);
};