//-----------------------------------------------------------------------------
// Game_Item
//
// The game object class for handling skills, items, weapons, and armor. It is
// required because save data should not include the database object itself.

import MATTER_ABS from "../MatterActionBattleSystem";
import ACTION_SEQUENCES from "../action-sequences/action-sequences";

function noteMetaError(msg) {
    throw new Error(`${msg} for ${this.isSkill() ? 'skill' : 'item'} ID ${this._itemId}`);
};

Object.defineProperties(Game_Item.prototype, {
    meta: { get: function() { return this.object().meta; }, configurable: false },
});

Game_Item.prototype.actionSequence = function() {
    const actionKey = this.meta.actionSeq;
    if (actionKey && ACTION_SEQUENCES[actionKey]) {
        return ACTION_SEQUENCES[actionKey];
    } else if (actionKey && !ACTION_SEQUENCES[actionKey]) {
        return noteMetaError.call(this, `could not find action sequence key '${actionKey}'`);
    }
    return null;
};

Game_Item.prototype.forceMagnitude = function() {
    const force = this.meta.force;
    if (force) {
        if (isNaN(Number(force))) return noteMetaError.call(this, `force '${force}' must be a number`);
        return Number(force);
    }
    if (this.isWeapon()) return MATTER_ABS.DEFAULT_WEAPON_FORCE;
    return 0;
};

Game_Item.prototype.range = function() {
    const range = Number(this.meta.range);
    if (range) return range;
    if (this.isWeapon()) return MATTER_ABS.DEFAULT_WEAPON_FORCE;
    return MATTER_ABS.DEFAULT_ACTION_RANGE;
};