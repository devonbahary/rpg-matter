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
    return this.isSkill() ? ACTION_SEQUENCES["DEFAULT"] : null;
};

Game_Item.prototype.forceMagnitude = function() {
    const force = Number(this.meta.force);
    if (force) {
        if (isNaN(force)) return noteMetaError.call(this, `force '${force}' must be a number`);
        return force;
    }
    if (this.isWeapon()) return MATTER_ABS.DEFAULT_WEAPON_FORCE;
    return 0;
};

Game_Item.prototype.range = function() {
    const range = Number(this.meta.range);
    if (range) return range;
    if (this.isWeapon()) return MATTER_ABS.DEFAULT_RANGES.WEAPONS;
    return MATTER_ABS.DEFAULT_RANGES.SKILLS;
};

Game_Item.prototype.hitStunResist = function() {
    const hitStunResist = parseInt(this.meta.hitStunResist);
    if (!isNaN(hitStunResist)) return hitStunResist;
    return 0;
};

Game_Item.prototype.hitStun = function() {
    const hitStun = parseInt(this.meta.hitStun);
    if (!isNaN(hitStun)) return hitStun;
    if (this.isWeapon()) return MATTER_ABS.DEFAULT_HIT_STUN.WEAPONS;
    return MATTER_ABS.DEFAULT_HIT_STUN.SKILLS;
};

Game_Item.prototype.hitStop = function() {
    const hitStop = parseInt(this.meta.hitStop);
    if (hitStop) return hitStop;
    return 0;
};

Game_Item.prototype.hitStopZoomScale = function() {
    const hitStopScale = Number(this.meta.hitStopZoomScale);
    if (hitStopScale) return hitStopScale;
};

Game_Item.prototype.isChanneled = function() {
    const isChanneled = this.meta.channeled;
    return isChanneled ? JSON.parse(isChanneled) : false;
};

Game_Item.prototype.isSameAs = function(gameItem) {
    return this._dataClass === gameItem._dataClass && this._itemId === gameItem._itemId;
};