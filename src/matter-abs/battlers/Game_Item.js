//-----------------------------------------------------------------------------
// Game_Item
//
// The game object class for handling skills, items, weapons, and armor. It is
// required because save data should not include the database object itself.

import MATTER_ABS from "../MatterActionBattleSystem";
import ACTION_SEQUENCES from "../action-sequences/action-sequences";
import { AOE_TYPES } from "../constants";

function noteMetaError(msg) {
    throw new Error(`${msg} for ${this.isSkill() ? 'skill' : 'item'} ID ${this._itemId}`);
};

Object.defineProperties(Game_Item.prototype, {
    iconIndex: { get: function() { return this.object().iconIndex; }, configurable: false },
    meta: { get: function() { return this.object().meta; }, configurable: false },
});

Game_Item.prototype.actionSequence = function() {
    const actionKey = this.meta.actionSeq;
    if (actionKey && ACTION_SEQUENCES[actionKey]) {
        return ACTION_SEQUENCES[actionKey];
    } else if (actionKey && !ACTION_SEQUENCES[actionKey]) {
        return noteMetaError.call(this, `could not find action sequence key '${actionKey}'`);
    }
    return ACTION_SEQUENCES["DEFAULT"];
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

Game_Item.prototype.aoe = function() {
    const aoe = this.meta.aoe || '';
    const regex = new RegExp(`${Object.values(AOE_TYPES).join('|')}`, 'i');
    const aoeMatch = aoe.match(regex);
    if (aoeMatch) return aoeMatch[0].toLowerCase();
    return AOE_TYPES.SQUARE;
};

Game_Item.prototype.isSameAs = function(gameItem) {
    return this._dataClass === gameItem._dataClass && this._itemId === gameItem._itemId;
};

Game_Item.prototype.isProjectile = function() {
    return Boolean(this.meta.projectile);
};

Game_Item.prototype.projectileForce = function() {
    const force = Number(this.meta.projectileForce);
    if (isNaN(force)) return 1;
    return force;
};

Game_Item.prototype.canGuardCancel = function() {
    const canGuardCancel = this.meta.canGuardCancel;
    if (canGuardCancel) return JSON.parse(canGuardCancel);
    return MATTER_ABS.GUARD_CANCEL_DEFAULT;
};

Game_Item.prototype.cooldown = function() {
    const cooldown = parseInt(this.meta.cooldown);
    if (isNaN(cooldown)) {
        if (this.isSkill()) return MATTER_ABS.DEFAULT_COOLDOWNS.SKILLS;
        else if (this.isItem()) return MATTER_ABS.DEFAULT_COOLDOWNS.ITEMS;    
    }
    return cooldown;
};

Game_Item.prototype.aggro = function() {
    const aggro = parseInt(this.meta.aggro);
    if (aggro) return aggro;
    return 0;
};

Game_Item.prototype.isGuardBreaking = function() {
    const guardBreak = this.meta.guardBreak;
    if (guardBreak) return JSON.parse(guardBreak);
    return false;
};