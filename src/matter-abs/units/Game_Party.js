//-----------------------------------------------------------------------------
// Game_Party
//
// The game object class for the party. Information such as gold and items is
// included.

import MATTER_ABS from "../MatterActionBattleSystem";

Object.defineProperties(Game_Party.prototype, {
    isInAction: { get: function() { return this.members().some(m => m.hasAction()); }, configurable: false },
    isInBattle: { get: function() { return this.hasAggro(); }, configurable: false },
});

Game_Party.prototype.gainExp = function(exp) {
    for (const actor of this.allMembers()) {
        actor.gainExp(exp);
    }
};

Game_Party.prototype.opponentsUnit = function() {
    return $gameTroop;
};

const _Game_Party_gainGold = Game_Party.prototype.gainGold;
Game_Party.prototype.gainGold = function(amount) {
    _Game_Party_gainGold.call(this, amount);
    if (amount <= 0) return;
    $gameMap.addLog({
        iconIndex: MATTER_ABS.WINDOW_GOLD_ICON_INDEX,
        message: TextManager.obtainGold.format(amount),
    });
    AudioManager.playSe({ 
        name: MATTER_ABS.COLLECTIBLE_ITEMS.GOLD_PICKUP_SE, 
        volume: MATTER_ABS.COLLECTIBLE_ITEMS.GOLD_PICKUP_VOL, 
        pitch: MATTER_ABS.COLLECTIBLE_ITEMS.GOLD_PICKUP_PITCH, 
    });
};

const _Game_Party_gainItem = Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
    _Game_Party_gainItem.call(this, item, amount, includeEquip);
    if (!item || amount <= 0) return;
    $gameMap.addLog({ 
        iconIndex: item.iconIndex, 
        message: TextManager.obtainItem.format(item.name),
    });
    AudioManager.playSe({ 
        name: MATTER_ABS.COLLECTIBLE_ITEMS.ITEM_PICKUP_SE, 
        volume: MATTER_ABS.COLLECTIBLE_ITEMS.ITEM_PICKUP_VOL, 
        pitch: MATTER_ABS.COLLECTIBLE_ITEMS.ITEM_PICKUP_PITCH,
    });
};