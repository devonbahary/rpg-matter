import MATTER_ABS from "../MatterActionBattleSystem";

//-----------------------------------------------------------------------------
// Sprite_Character
//
// The sprite for displaying a character.

const _Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
Sprite_Character.prototype.initMembers = function() {
    _Sprite_Character_initMembers.call(this);
    this._battlerParametersSprite = new Sprite_BattlerParameters(this._character);
    this.addChild(this._battlerParametersSprite);
};

const _Sprite_Character_setCharacter = Sprite_Character.prototype.setCharacter;
Sprite_Character.prototype.setCharacter = function(character) {
    _Sprite_Character_setCharacter.call(this, character);
    this._battlerParametersSprite.setCharacter(character);
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

Sprite_BattlerParameters.prototype.initialize = function(character) {
    Sprite_Base.prototype.initialize.call(this);
    Window_Base.prototype.loadWindowskin.call(this);
    this.setCharacter(character);
    this.initMembers();
};

Sprite_BattlerParameters.prototype.initMembers = function() {
    this._hp = 0;
    this._mhp = 0;
};

Sprite_BattlerParameters.prototype.createBitmap = function() {
    var tileWidth = $gameMap.tileWidth();
    this.bitmap = new Bitmap(tileWidth - 4, MATTER_ABS.GAUGE_HEIGHT);
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
    if (this._battler.hp !== this._hp || this._battler.mhp !== this._mhp) {
        this._hp = this._battler.hp;
        this._mhp = this._battler.mhp;
        
        const color1 = this.hpGaugeColor1();
        const color2 = this.hpGaugeColor2();
        const fillW = (this.width - 2) * this._battler.hpRate();
        this.bitmap.clear();
        this.bitmap.fillAll(Window_Base.prototype.gaugeBackColor.call(this));
        this.bitmap.gradientFillRect(1, 1, fillW, MATTER_ABS.GAUGE_HEIGHT - 2, color1, color2)
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