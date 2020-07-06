import MATTER_ABS from "../MatterActionBattleSystem";

//-----------------------------------------------------------------------------
// Sprite_Character
//
// The sprite for displaying a character.

const _Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
Sprite_Character.prototype.initMembers = function() {
    _Sprite_Character_initMembers.call(this);
    this._battlerParametersSprite = new Sprite_BattlerParameters();
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

Sprite_BattlerParameters.prototype.initialize = function() {
    Sprite_Base.prototype.initialize.call(this);
    Window_Base.prototype.loadWindowskin.call(this);
    this.initMembers();
};

Sprite_BattlerParameters.prototype.initMembers = function() {
    this._hp = 0;
    this._mhp = 0;
    this._spriteActionText = new Sprite_ActionText();
    this.addChild(this._spriteActionText);
};

Sprite_BattlerParameters.prototype.gaugeHeight = function() {
    return MATTER_ABS.GAUGE_HEIGHT;
};

Sprite_BattlerParameters.prototype.createBitmap = function() {
    var tileWidth = $gameMap.tileWidth();
    this.bitmap = new Bitmap(tileWidth - 4, this.gaugeHeight());
    this.anchor.x = 0.5;
};

Sprite_BattlerParameters.prototype.setCharacter = function(character) {
    this._character = character;
    this._spriteActionText.setCharacter(character);
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
    return this._battler && (this._battler.isAlive() || this._battler.isHitStopped());
};

Sprite_BattlerParameters.prototype.updateGauge = function() {
    if (!this.shouldUpdate()) return;
    this.drawGauge();
    this.memorizeMembers();
};

Sprite_BattlerParameters.prototype.memorizeMembers = function() {
    this._hp = this._battler.hp;
    this._mhp = this._battler.mhp;
    this._latestDamageForGauge = this._battler.latestDamageForGauge;
};

Sprite_BattlerParameters.prototype.drawGauge = function() {
    const latestDamage = this._battler.latestDamageForGauge;
    const hpColor1 = this.hpGaugeColor1();
    const hpColor2 = this.hpGaugeColor2();
    const hpChangeColor1 = latestDamage >= 0 ? this.hpDamageGaugeColor1() : this.hpRecoveryGaugeColor1();
    const hpChangeColor2 = latestDamage >= 0 ? this.hpDamageGaugeColor2() : this.hpRecoveryGaugeColor2();
    const hpFillW = (this.width - 2) * this._battler.hpRate();
    let hpChangeFillW;
    if (latestDamage >= 0) {
        hpChangeFillW = (this.width - 2) * Math.min(latestDamage, this._hp) / this._battler.mhp;
    } else {
        hpChangeFillW = (this.width - 2) * Math.max(latestDamage, this._hp - this._mhp) / this._battler.mhp;
    }
    this.bitmap.clear();
    this.bitmap.fillAll(Window_Base.prototype.gaugeBackColor.call(this));
    this.bitmap.gradientFillRect(1, 1, hpFillW, this.gaugeHeight() - 2, hpColor1, hpColor2);
    this.bitmap.gradientFillRect(1 + hpFillW, 1, hpChangeFillW, this.gaugeHeight() - 2, hpChangeColor1, hpChangeColor2);
};

Sprite_BattlerParameters.prototype.shouldUpdate = function() {
    return (
        this._battler.hp !== this._hp || 
        this._battler.mhp !== this._mhp ||
        this._battler.latestDamageForGauge !== this._latestDamageForGauge
    );
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

Sprite_BattlerParameters.prototype.hpDamageGaugeColor1 = function() {
    return this.textColor(2);
};

Sprite_BattlerParameters.prototype.hpDamageGaugeColor2 = function() {
    return this.textColor(10);
};

Sprite_BattlerParameters.prototype.hpRecoveryGaugeColor1 = function() {
    return this.textColor(3);
};

Sprite_BattlerParameters.prototype.hpRecoveryGaugeColor2 = function() {
    return this.textColor(11);
};

global["Sprite_BattlerParameters"] = Sprite_BattlerParameters;


//-----------------------------------------------------------------------------
// Sprite_ActionText
//
// The sprite for displaying overhead action text.

function Sprite_ActionText() {
    this.initialize.apply(this, arguments);
}

Sprite_ActionText.prototype = Object.create(Sprite_Base.prototype);
Sprite_ActionText.prototype.constructor = Sprite_ActionText;

Object.defineProperties(Sprite_ActionText.prototype, {
    _battler: { get: function() { return this._character.battler; }, configurable: false },
    _actionName: { get: function() { 
        if (!this._battler || !this._battler.hasAction()) return null;
        const dataItem = this._battler.currentAction().item();
        return dataItem.meta.noLog ? null : dataItem.name;
    }, configurable: false },
});

Sprite_ActionText.prototype.initialize = function() {
    Sprite_Base.prototype.initialize.call(this);
    Window_Base.prototype.loadWindowskin.call(this);
    this.height = 24;
    this.y -= this.height;
    this.actionNameMem = null;
    this.initBitmap();
};

Sprite_ActionText.prototype.initBitmap = function() {
    this.bitmap = new Bitmap(120, 18);
    this.anchor.x = 0.5;
    this.bitmap.fontSize = 12;
    this.bitmap.outlineColor = 'rgba(0, 0, 0, 0.8)';
};

Sprite_ActionText.prototype.setCharacter = function(character) {
    this._character = character;
    this.refresh();
};

Sprite_ActionText.prototype.refresh = function() {
    const text = this._actionName;
    if (!text) return this.bitmap.clear();
    this.bitmap.drawText(text, 0, 0, 120, 18, 'center');
}

Sprite_ActionText.prototype.update = function() {
    if (!this._character) return;
    if (this.actionNameMem !== this._actionName) {
        this.actionNameMem = this._actionName;
        this.refresh();
    }
}