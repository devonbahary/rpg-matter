//-----------------------------------------------------------------------------
// Sprite_CollectibleItem
//
// The sprite for displaying a Game_CollectibleItem.

import MATTER_ABS from "../MatterActionBattleSystem";

function Sprite_CollectibleItem() {
    this.initialize.apply(this, arguments);
}

Sprite_CollectibleItem.prototype = Object.create(Sprite_Base.prototype);
Sprite_CollectibleItem.prototype.constructor = Sprite_CollectibleItem;

Object.defineProperties(Sprite_CollectibleItem.prototype, {
    isGold: { get: function() { return this._collectibleItem.isGold; }, configurable: false },
    isItem: { get: function() { return this._collectibleItem.isItem; }, configurable: false },
});

Sprite_CollectibleItem.prototype.initialize = function(collectibleItem) {
    Sprite_Base.prototype.initialize.call(this);
    this._collectibleItem = collectibleItem;
    this.initMembers();
};

Sprite_CollectibleItem.prototype.initMembers = function() {
    this.anchor.x = 0.5;
    this.anchor.y = 1;
    this.setupBitmap();
    this._floatCount = Math.round(Math.random() * 2 * Math.PI);
};

Sprite_CollectibleItem.prototype.setupBitmap = function() {
    this.bitmap = ImageManager.loadSystem('IconSet');
    const pw = Window_Base._iconWidth;
    const ph = Window_Base._iconHeight;
    const sx = this._collectibleItem.iconIndex % 16 * pw;
    const sy = Math.floor(this._collectibleItem.iconIndex / 16) * ph;
    this.setFrame(sx, sy, pw, ph);
};

Sprite_CollectibleItem.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    this.updatePosition();
    this.updateFloatCount();
};

Sprite_CollectibleItem.prototype.updatePosition = function() {
    this.x = this._collectibleItem.screenX();
    this.y = this._collectibleItem.screenY() + this.floatY();
    this.z = this._collectibleItem.screenZ();
};

Sprite_CollectibleItem.prototype.updateFloatCount = function() {
    this._floatCount += this.floatRate();
};

Sprite_CollectibleItem.prototype.floatRate = function() {
    if (this.isGold) return MATTER_ABS.COLLECTIBLE_ITEMS.GOLD_FLOAT_RATE;
    return MATTER_ABS.COLLECTIBLE_ITEMS.ITEM_FLOAT_RATE;
};

Sprite_CollectibleItem.prototype.floatY = function() {
    return this.floatHeight() * Math.sin(this._floatCount / Math.PI);
};

Sprite_CollectibleItem.prototype.floatHeight = function() {
    if (this.isGold) return MATTER_ABS.COLLECTIBLE_ITEMS.GOLD_FLOAT_HEIGHT;
    return MATTER_ABS.COLLECTIBLE_ITEMS.ITEM_FLOAT_HEIGHT;
};


global["Sprite_CollectibleItem"] = Sprite_CollectibleItem;