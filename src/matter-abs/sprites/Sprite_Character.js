//-----------------------------------------------------------------------------
// Sprite_Character
//
// The sprite for displaying a character.

import { isAnimationPaused } from "./util";

Object.defineProperties(Sprite_Character.prototype, {
    _battler: { get: function() { return this._character.battler; }, configurable: false },
});

const _Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
Sprite_Character.prototype.initMembers = function() {
    _Sprite_Character_initMembers.call(this);
    this._appeared = false;
    this._effectType = null;
    this._effectDuration = 0;
    this._shake = 0;
    this._damageSprites = [];
};

const _Sprite_Character_update = Sprite_Character.prototype.update;
Sprite_Character.prototype.update = function() {
    this.updateDamageSprites();
    this.updateTargetSelection();
    this.updateHitStunShake();
    _Sprite_Character_update.call(this);
    if (this._battler) this.updateEffect();
};

Sprite_Character.prototype.updateDamageSprites = function() {
    if (!this._battler) return;
    while (this._battler.isDamagePopupsRequested()) {
        const damage = this._battler._damagePopups.pop();
        const sprite = new Sprite_DamageABS(this._battler, damage);
        this._damageSprites.push(sprite);
        this.addChild(sprite);
    }
};

Sprite_Character.prototype.updateTargetSelection = function() {
    if (
        $gameMap.isSelectionMode &&
        $gamePlayer.targetSelection &&
        $gamePlayer.targetSelection.character === this._character
    ) {
        this.updateTargetSelectionEffect();
    }
};

Sprite_Character.prototype.updateTargetSelectionEffect = function() {
    if (this.isEffecting()) return;
    this._effectType = 'whiten';
    this.startWhiten();
};

Sprite_Character.prototype.updateHitStunShake = function() {
    if (this._character.isHitStopped()) {
        if (this._character.isHitStopTarget()) {
            this._shake = this._character.battler._hitStop % 4 * 2 - 2;
        } else {
            this._shake = this._character.battler._hitStop % 2 * 2 - 1;
        }
    } else if (this._character.isHitStunned()) {
        this._shake = this._character.battler._hitStun % 2 * 2 - 1;
    } else if (this._shake) {
        this._shake = 0;
    }
};

const _Sprite_Character_patternHeight = Sprite_Character.prototype.patternHeight;
Sprite_Character.prototype.patternHeight = function() {
    if (this._effectType === 'bossCollapse' && this._effectDuration) return this._effectDuration;
    return _Sprite_Character_patternHeight.call(this);
};

const _Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
Sprite_Character.prototype.updatePosition = function() {
    _Sprite_Character_updatePosition.call(this);
    this.x += this._shake;
};

// borrowed from Sprite_Enemy.setupEffect()
Sprite_Character.prototype.setupEffect = function() {
    if (this._appeared && this._battler.isEffectRequested()) {
        this.startEffect(this._battler.effectType());
        this._battler.clearEffect();
    }
    if (!this._appeared && this._battler.isAlive()) {
        this.startEffect('appear');
    } else if (this._appeared && this._battler.isHidden()) {
        this.startEffect('disappear');
    }
};

Sprite_Character.prototype.isAnimationPaused = function() {
    return isAnimationPaused.call(this);
};

Sprite_Character.prototype.startAppear = function() {
    Sprite_Enemy.prototype.startAppear.call(this);
};

Sprite_Character.prototype.startDisappear = function() {
    Sprite_Enemy.prototype.startDisappear.call(this);
};

Sprite_Character.prototype.startEffect = function(effectType) {
    Sprite_Enemy.prototype.startEffect.call(this, effectType);
};

Sprite_Character.prototype.startWhiten = function() {
    Sprite_Enemy.prototype.startWhiten.call(this);
};

Sprite_Character.prototype.startBlink = function() {
    Sprite_Enemy.prototype.startBlink.call(this);
};

Sprite_Character.prototype.updateAppear = function() {
    Sprite_Enemy.prototype.updateAppear.call(this);
};

Sprite_Character.prototype.updateDisappear = function() {
    Sprite_Enemy.prototype.updateDisappear.call(this);
};

Sprite_Character.prototype.startCollapse = function() {
    Sprite_Enemy.prototype.startCollapse.call(this);
};

Sprite_Character.prototype.startBossCollapse = function() {
    this._effectDuration = this.patternHeight();
    this._appeared = false;
};

Sprite_Character.prototype.startInstantCollapse = function() {
    Sprite_Enemy.prototype.startInstantCollapse.call(this);
};

Sprite_Character.prototype.isEffecting = function() {
    return Sprite_Enemy.prototype.isEffecting.call(this);
};

Sprite_Character.prototype.updateEffect = function() {
    // taken from Sprite_Enemy.updateEffect()
    this.setupEffect();
    if (this._effectDuration > 0) {
        this._effectDuration--;
        switch (this._effectType) {
        case 'whiten':
            this.updateWhiten();
            break;
        case 'blink':
            this.updateBlink();
            break;
        case 'appear':
            this.updateAppear();
            break;
        case 'disappear':
            this.updateDisappear();
            break;
        case 'collapse':
            this.updateCollapse();
            break;
        case 'bossCollapse':
            this.updateBossCollapse();
            break;
        case 'instantCollapse':
            this.updateInstantCollapse();
            break;
        }
        if (this._effectDuration === 0) {
            this._effectType = null;
            this._battler.fulfillEffect(); // boom
        }
    }
};

Sprite_Character.prototype.revertToNormal = function() {
    Sprite_Enemy.prototype.revertToNormal.call(this);
};

Sprite_Character.prototype.updateWhiten = function() {
    Sprite_Enemy.prototype.updateWhiten.call(this);
};

Sprite_Character.prototype.updateBlink = function() {
    Sprite_Enemy.prototype.updateBlink.call(this);
};

Sprite_Character.prototype.updateCollapse = function() {
    Sprite_Enemy.prototype.updateCollapse.call(this);
};

Sprite_Character.prototype.updateBossCollapse = function() {
    Sprite_Enemy.prototype.updateBossCollapse.call(this);
};

Sprite_Character.prototype.updateInstantCollapse = function() {
    Sprite_Enemy.prototype.updateInstantCollapse.call(this);
};