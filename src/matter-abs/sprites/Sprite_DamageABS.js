//-----------------------------------------------------------------------------
// Sprite_DamageABS
//
// The sprite for displaying a popup damage.

function Sprite_DamageABS() {
    this.initialize.apply(this, arguments);
}

Sprite_DamageABS.prototype = Object.create(Sprite.prototype);
Sprite_DamageABS.prototype.constructor = Sprite_DamageABS;

Sprite_DamageABS.prototype.initialize = function(battler, damage) {
    Sprite.prototype.initialize.call(this);
    this._duration = 60;
    this._damageBitmap = ImageManager.loadSystem('Damage');
    this.setup(battler, damage);
};

Sprite_DamageABS.prototype.setup = function(battler, damage) {
    // TODO: mp, critical handling
    this._battler = battler;
    let baseRow;
    if (damage >= 0) baseRow = 0;
    else if (damage < 0) baseRow = 1;
    this.createDigits(baseRow, damage);
};

Sprite_DamageABS.prototype.digitWidth = function() {
    return Sprite_Damage.prototype.digitWidth.call(this);
};

Sprite_DamageABS.prototype.digitHeight = function() {
    return Sprite_Damage.prototype.digitHeight.call(this);
};

Sprite_DamageABS.prototype.createDigits = function(baseRow, value) {
    Sprite_Damage.prototype.createDigits.call(this, baseRow, value);
};

Sprite_DamageABS.prototype.createChildSprite = function() {
    const childSprite = Sprite_Damage.prototype.createChildSprite.call(this);
    childSprite.oy = childSprite.y;
    childSprite.dy = 0;
    return childSprite;
};

Sprite_DamageABS.prototype.update = function() {
    Sprite.prototype.update.call(this);
    if (this._battler.isHitStopped()) return;
    if (this._duration > 0) {
        this._duration--;
        for (const child of this.children) {
            this.updateChild(child);
        }
    }
    this.updateOpacity();
};

Sprite_DamageABS.prototype.updateChild = function(sprite) {
    sprite.dy += 0.5;
    sprite.y = sprite.oy - Math.round(sprite.dy);
};

Sprite_DamageABS.prototype.updateOpacity = function() {
    Sprite_Damage.prototype.updateOpacity.call(this);
};

Sprite_DamageABS.prototype.isPlaying = function() {
    return Sprite_Damage.prototype.isPlaying.call(this);
};

global["Sprite_DamageABS"] = Sprite_DamageABS;