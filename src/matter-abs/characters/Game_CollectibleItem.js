//-----------------------------------------------------------------------------
// Game_CollectibleItem
//
// The game object class for a collectible map item.

import { BODY_LABELS } from "../../matter-core/constants";
import MATTER_ABS from "../MatterActionBattleSystem";

function Game_CollectibleItem() {
    this.initialize.apply(this, arguments);
}

Game_CollectibleItem.prototype = Object.create(Game_Character.prototype);
Game_CollectibleItem.prototype.constructor = Game_CollectibleItem;

Object.defineProperties(Game_CollectibleItem.prototype, {
    isGold: { get: function() { return Boolean(this._gold); }, configurable: false },
    isItem: { get: function() { return Boolean(this._dataItem); }, configurable: false },
    iconIndex: { get: function() { 
        if (this.isGold) return MATTER_ABS.WINDOW_GOLD_ICON_INDEX;
        if (this.isItem) return this._dataItem.iconIndex;
        return 0;
    }, configurable: false },
});


Game_CollectibleItem.prototype.initialize = function() {
    Game_Character.prototype.initialize.call(this);
    this.setThrough(true);
};

Game_CollectibleItem.prototype.setGold = function(gold) {
    this._gold = gold;
};

Game_CollectibleItem.prototype.setItem = function(dataItem) {
    this._dataItem = dataItem;
};

Game_CollectibleItem.prototype.onCollisionStart = function(event) {
    if (event.pair.label !== BODY_LABELS.PLAYER) return;

    if (this.isGold) $gameParty.gainGold(this._gold);
    if (this.isItem) $gameParty.gainItem(this._dataItem, 1);
    this.removeFromScene();
};

Game_CollectibleItem.prototype.locateWithRandomness = function(x, y) {
    const dx = this.generateRandomLocationValue() / $gameMap.tileWidth();
    const dy = this.generateRandomLocationValue() / $gameMap.tileHeight();
    this.locate(x + dx, y + dy);
};


Game_CollectibleItem.prototype.generateRandomLocationValue = function() {
    const sign = Math.round(Math.random()) ? 1 : -1;
    return sign * Math.random() * 24;
};

global["Game_CollectibleItem"] = Game_CollectibleItem;