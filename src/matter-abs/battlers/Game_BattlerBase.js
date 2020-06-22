//-----------------------------------------------------------------------------
// Game_BattlerBase
//
// The superclass of Game_Battler. It mainly contains parameters calculation.

import { size } from "lodash";
import { v4 as uuidv4 } from "uuid";
import MATTER_ABS from "../MatterActionBattleSystem";

Object.defineProperties(Game_BattlerBase.prototype, {
    // AGgro Rate
    agr: { get: function() { return 1; }, configurable: false },
    weapon: { get: function() { return null; }, configurable: false },
});

Game_BattlerBase.HRG_DATA_ID = 7;
Game_BattlerBase.MRG_DATA_ID = 8;
Game_BattlerBase.TRG_DATA_ID = 9;
Game_BattlerBase.REGENERATION_XPARAM_DATA_IDS = [ 
    Game_BattlerBase.HRG_DATA_ID,
    Game_BattlerBase.MRG_DATA_ID,
    Game_BattlerBase.TRG_DATA_ID,
];

Game_BattlerBase.AUTO_REMOVAL_TIMINGS = {
    NONE: 0,
    ACTION_END: 1,
    TURN_END: 2,
};

const _Game_BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers;
Game_BattlerBase.prototype.initMembers = function() {
    _Game_BattlerBase_initMembers.call(this);
    this.id = uuidv4();
    this.resetAggro();
    this.initHitStun();
    this.initHitStop();
    this.resetCooldowns();
    this._isInPostDeathProcessing = false;
};

Game_BattlerBase.prototype.initHitStun = function() {
    this._hitStun = 0;
    this._hitStunResist = 0;
};

// powerful attack visual effect
Game_BattlerBase.prototype.initHitStop = function() {
    this._hitStop = 0; 
    this._hitStopCallbacks = null;
    this._isHitStopTarget = false;
};

Game_BattlerBase.prototype.resetCooldowns = function() {
    this._skillCooldowns = {};
    this._itemCooldowns = {};
};

Game_BattlerBase.prototype.actionCooldown = function(dataItem) {
    if (DataManager.isSkill(dataItem)) return this._skillCooldowns[dataItem.id];
    else if (DataManager.isItem(dataItem)) return this._itemCooldowns[dataItem.id];
    return 0;
};

const _Game_BattlerBase_isStateExpired = Game_BattlerBase.prototype.isStateExpired;
Game_BattlerBase.prototype.isStateExpired = function(stateId) {
    // states of Action End auto removal timing type expire at the end of actions
    if ($dataStates[stateId].autoRemovalTiming === Game_BattlerBase.AUTO_REMOVAL_TIMINGS.ACTION_END) return true;
    return _Game_BattlerBase_isStateExpired.call(this, stateId);
};

const _Game_BattlerBase_resetStateCounts = Game_BattlerBase.prototype.resetStateCounts;
Game_BattlerBase.prototype.resetStateCounts = function(stateId) {
    _Game_BattlerBase_resetStateCounts.call(this, stateId);
    this._stateTurns[stateId] *= MATTER_ABS.BATTLE_FRAMES_IN_TURN;
};

const _Game_BattlerBase_meetsUsableItemConditions = Game_BattlerBase.prototype.meetsUsableItemConditions;
Game_BattlerBase.prototype.meetsUsableItemConditions = function(dataItem) {
    return _Game_BattlerBase_meetsUsableItemConditions.call(this, dataItem) && !this.actionCooldown(dataItem);
};

Game_BattlerBase.prototype.hitStunResist = function() {
    return this._hitStunResist;
};

const _Game_BattlerBase_canMove = Game_BattlerBase.prototype.canMove;
Game_BattlerBase.prototype.canMove = function() {
    return _Game_BattlerBase_canMove.call(this) && !this.isHitStunned();
};

Game_BattlerBase.prototype.isOccasionOk = function(item) {
    return item.occasion < 3; // not "never"
};

Game_BattlerBase.prototype.update = function() {
    this.updateHitStop();
    if (!this._hitStop && this.isAlive()) this.updateActive();
    if (this._isInPostDeathProcessing) this.updatePostDeathProcessing();
};

Game_BattlerBase.prototype.updateActive = function() {
    this.updateHitStun();
    this.updateCooldowns();
};

Game_BattlerBase.prototype.updateHitStop = function() {
    if (this._hitStop) this._hitStop--;
    if (!this._hitStop && this._hitStopCallbacks) {
        for (const cb of this._hitStopCallbacks) cb();
        this._hitStopCallbacks = null;
        this._isHitStopTarget = false;
    }
};

Game_BattlerBase.prototype.updateHitStun = function() {
    if (this._hitStun) this._hitStun--;
}

Game_BattlerBase.prototype.updateCooldowns = function() {
    this.updateCooldown(this._skillCooldowns);
    this.updateCooldown(this._itemCooldowns);
};

Game_BattlerBase.prototype.updateCooldown = function(cooldowns) {
    for (const itemId of Object.keys(cooldowns)) {
        if (cooldowns[itemId]) cooldowns[itemId]--;
        if (cooldowns[itemId] <= 0) delete cooldowns[itemId];
    }
};

Game_BattlerBase.prototype.applyCooldown = function(action) {
    const cooldown = action.cooldown();
    if (!cooldown) return;
    
    const dataItem = action.item();
    if (DataManager.isSkill(dataItem)) {
        this._skillCooldowns[dataItem.id] = cooldown;
    } else if (DataManager.isItem(dataItem)) {
        this._itemCooldowns[dataItem.id] = cooldown;
    }
};

Game_BattlerBase.prototype.applyHitStun = function(value) {
    // can't be stunned and result in being stunned for less than an already active stun
    value = Math.round(Math.max(0, value - this.hitStunResist()));
    if (value > this._hitStun) this._hitStun = value; 
};

Game_BattlerBase.prototype.applyHitStop = function(value, callbacks, isTarget = false) {
    this._hitStop = value;
    this._hitStopCallbacks = callbacks;
    this._isHitStopTarget = isTarget;
};

Game_BattlerBase.prototype.isHitStunned = function() { 
    return this._hitStun;
};

Game_BattlerBase.prototype.isHitStopped = function() {
    return this._hitStop;
};

Game_Battler.prototype.isHitStopTarget = function() {
    return this._isHitStopTarget;
};

Game_BattlerBase.prototype.resetAggro = function() {
    this._aggro = {};
};

Game_BattlerBase.prototype.gainAggro = function(battler, value) {
    if (!this.shouldGainAggro(battler)) return;
    
    const val = battler.agr * value;
    if (!this._aggro[battler.id]) this._aggro[battler.id] = val;
    else this._aggro[battler.id] += val;
};

Game_BattlerBase.prototype.shouldGainAggro = function(battler) {
    if (this.isDead() || this.isFriendWith(battler)) return false;
    return true;
};

Game_BattlerBase.prototype.hasAggro = function() {  
    return size(this._aggro);
};

Game_BattlerBase.prototype.clearBattlerAggro = function(battler) {
    delete this._aggro[battler.id];
};

Game_BattlerBase.prototype.topAggroBattler = function() {
    const topAggroBattlerId = Object.entries(this._aggro).reduce((topAggroBattlerId, [ battlerId, aggro ]) => {
        if (!topAggroBattlerId || aggro > this._aggro[topAggroBattlerId]) return battlerId;
        return topAggroBattlerId;
    }, null);
    return this.opponentsUnit().battlerById(topAggroBattlerId);
};

Game_BattlerBase.prototype.isFriendWith = function(battler) {
    return false;
};

Game_BattlerBase.prototype.isEnemyWith = function(battler) {
    return false;
};

const _Game_BattlerBase_die = Game_BattlerBase.prototype.die;
Game_BattlerBase.prototype.die = function() {
    _Game_BattlerBase_die.call(this);
    this._hitStun = 0;
    this.resetAggro();
    $gameMap.addLog({
        iconIndex: MATTER_ABS.WINDOW_DEFEAT_ICON_INDEX,
        message: TextManager.defeat.format(this.name()),
    });
    this.opponentsUnit().members().forEach(battler => {
        battler.clearBattlerAggro(this);
    });
    this._isInPostDeathProcessing = true;
};

Game_BattlerBase.prototype.cooldownRate = function(dataItem) {
    let cooldown;
    if (DataManager.isSkill(dataItem)) cooldown = this._skillCooldowns[dataItem.id];
    else if (DataManager.isItem(dataItem)) cooldown = this._itemCooldowns[dataItem.id];
    if (!cooldown) return 1;

    const totalCooldown = new Game_Item(dataItem).cooldown();
    return (totalCooldown - cooldown) / totalCooldown;
};

// overwrite to include (code, id)
Game_BattlerBase.prototype.traitObjects = function(code, id) {
    // don't include regeneration xparams in states
    if (code === Game_BattlerBase.TRAIT_XPARAM && Game_BattlerBase.REGENERATION_XPARAM_DATA_IDS.includes(id)) return [];
    return this.states();
};

// overwrite to include (code, id)
Game_BattlerBase.prototype.allTraits = function(code, id) {
    return this.traitObjects(code, id).reduce(function(r, obj) {
        return r.concat(obj.traits);
    }, []);
};

// overwrite to include (code, id)
Game_BattlerBase.prototype.traitsWithId = function(code, id) {
    return this.allTraits(code, id).filter(function(trait) {
        return trait.code === code && trait.dataId === id;
    });
};

// in seconds
Game_BattlerBase.prototype.stateDuration = function(stateId) {
    if (!this._stateTurns[stateId]) return 0;
    return this._stateTurns[stateId] / MATTER_ABS.BATTLE_FRAMES_IN_TURN;
};