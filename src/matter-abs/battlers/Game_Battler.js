//-----------------------------------------------------------------------------
// Game_Battler
//
// The superclass of Game_Actor and Game_Enemy. It contains methods for sprites
// and actions.

import { getMassFromMeta, getBooleanFromMeta } from "../../utils";
import MATTER_CORE from "../../matter-core/pluginParams";
import MATTER_ABS from "../MatterActionBattleSystem";
import { AUTO_REMOVAL_TIMINGS } from "../constants";

Object.defineProperties(Game_Battler.prototype, {
    actionSequence: { get: function() { return this._action.actionSequence(); }, configurable: false },
    imageName: { get: function() { return ''; }, configurable: false },
    imageIndex: { get: function() { return 0; }, configurable: false },
    mass: { get: function() { 
        return getMassFromMeta(this.data.meta.mass) || MATTER_CORE.CHARACTER_DEFAULT_MASS; 
    }, configurable: false },
    priorityType: { get: function() { return 1; }, configurable: false }, // same as characters
    stepAnime: { get: function() { return getBooleanFromMeta(this.data.meta.stepAnime); }, configurable: false },
    weaponIconIndex: { get: function() { return 0; }, configurable: false },
});

const _Game_Battler_initMembers = Game_Battler.prototype.initMembers;
Game_Battler.prototype.initMembers = function() {
    _Game_Battler_initMembers.call(this);
    this._effectTypeFulfilled = true;
    this.clearAction();
    this.character = null;
    this.latestDamageForGauge = 0;
    this._damagePopups = [];
    this._internalTurnCount = 0;
};

Game_Battler.prototype.requestDamagePopup = function(damage) {
    this._damagePopups.push(damage);
};

Game_Battler.prototype.isDamagePopupsRequested = function() {
    return this._damagePopups.length;
};

Game_Battler.prototype.isInternalTurnTick = function() {
    return this._internalTurnCount % MATTER_ABS.BATTLE_FRAMES_IN_TURN === 0;
};

Game_Battler.prototype.isStateTurnTick = function(stateId) {
    return this._stateTurns[stateId] % MATTER_ABS.BATTLE_FRAMES_IN_TURN === 0;
};

Game_Battler.prototype.update = function() {
    Game_BattlerBase.prototype.update.call(this);
    if (this._isInPostDeathProcessing) this.updatePostDeathProcessing();
}

Game_Battler.prototype.updatePostDeathProcessing = function() {
    if (this._hitStop) return; // allow hit stop to finish before processing death
    if (!this._effectType) {
        this.performCollapse();
    } else if (this._effectTypeFulfilled) {
        this.onEndDeathProcessing();
    }
};

Game_Battler.prototype.onEndDeathProcessing = function() {
    this._isInPostDeathProcessing = false;
};

Game_Battler.prototype.hitStunResist = function() {
    const baseValue = Game_BattlerBase.prototype.hitStunResist.call(this);
    if (this.currentAction()) return baseValue + this.currentAction().hitStunResist();
    return baseValue;
};

Game_Battler.prototype.currentAction = function() {
    return this._action; // overwrite
};

const _Game_Battler_requestEffect = Game_Battler.prototype.requestEffect;
Game_Battler.prototype.requestEffect = function(effectType) {
    _Game_Battler_requestEffect.call(this, effectType);
    this._effectTypeFulfilled = false;
};

Game_Battler.prototype.fulfillEffect = function() {
    this._effectTypeFulfilled = true;
};

Game_Battler.prototype.applyHitStun = function(value) {
    Game_BattlerBase.prototype.applyHitStun.call(this, value);
    if (this._hitStun) this.clearAction();
};

Game_Battler.prototype.clearAction = function() {
    if (this._action) this.applyCooldown(this._action);
    this._eligibleActionsMem = null; // serialized array of actions used to track when a new action set is available
    this._pursuedAction = null;
    this._pursuedActionCount = 0;
    this._action = null;
    this._actionFrame = 0;
    this._lastActionFrame = 0;
    this.removeStatesAuto(AUTO_REMOVAL_TIMINGS.ACTION_END);
};

// overwrite
Game_Battler.prototype.setAction = function(action) { 
    if (!this.canUse(action)) return;
    this.character.clearPathfinding();
    this.clearAction();
    this._action = new Game_ActionABS(this, action);
    this.useItem(action);
};

Game_Battler.prototype.hasAction = function() {
    return !!this._action;
};

Game_Battler.prototype.updateActive = function() {
    Game_BattlerBase.prototype.updateActive.call(this);
    this.updateLatestDamageForGauge();
    if (this.hasActionSequence()) this.updateActionSeq();
    this.updateBehavior();
    this.onTurnEnd();
};

Game_Battler.prototype.updateLatestDamageForGauge = function() {
    if (!this._latestDamageForGaugeDuration) return; 
    this._latestDamageForGaugeDuration--;
    if (!this._latestDamageForGaugeDuration) this.latestDamageForGauge = 0;
};

Game_Battler.prototype.updateActionSeq = function() {
    if (!this._action) return;
    this._lastActionFrame = Math.floor(this._actionFrame);
    this._actionFrame += this.actionFrameProgressRate(); 
};

Game_Battler.prototype.actionSequenceProgressRate = function() {
    if (!this._action) return 0;
    return this._actionFrame / this._action.actionSequenceLength();
};

Game_Battler.prototype.isChanneling = function() {
    return this._action && this._action.isChanneled();
};

Game_Battler.prototype.actionFrameProgressRate = function() {
    return 1; // TODO: apply speed to this
};

Game_Battler.prototype.actionSequenceCommandsThisFrame = function() {
    const commands = [];
    // action frames can progress slower or faster than 1 per frame
    for (let i = Math.floor(this._lastActionFrame) + 1; i <= Math.floor(this._actionFrame); i++) {
        if (i === 1 && this.actionSequence[0]) commands.push(...this.actionSequence[0]); // apply 0-frame commands only once

        let frame = i;
        if (this.isChanneling()) {
            frame = i % this._action.actionSequenceLength() || 1; // cycle frames
            if (this._action.actionSequenceLength() === 1) frame = 1; // overcome 0 % 1 === 1 % 1 === 0 (never reaches 1)
        }
        
        if (this.actionSequence[frame]) commands.push(...this.actionSequence[frame]);
    }
    return commands;
}; 

Game_Battler.prototype.hasActionSequence = function() {
    return this.hasAction() && this.actionSequence;
};

Game_Battler.prototype.updateBehavior = function() {
    if (this.character === $gamePlayer || !this.canMove()) return;
    this.updateEligibleActions();
    this.updatePursuedAction();
};

Game_Battler.prototype.updateEligibleActions = function() {
    const eligibleActions = this.getEligibleActions();
    const serializedEligibleActions = JSON.stringify(eligibleActions);
    
    if (serializedEligibleActions !== this._eligibleActionsMem) {
        this._eligibleActionsMem = serializedEligibleActions;
        
        const ratingZero = this.getRatingZeroForActions(eligibleActions);
        const action = this.selectAction(eligibleActions, ratingZero);
        
        if (action) this._pursuedAction = $dataSkills[action.skillId];
    }
};

Game_Battler.prototype.selectAction = function(actionList, ratingZero) {
    return Game_Enemy.prototype.selectAction.call(this, actionList, ratingZero);
};

Game_Battler.prototype.getEligibleActions = function() {
    return [];
};

Game_Battler.prototype.getRatingZeroForActions = function(actions) {
    const ratingMax = Math.max.apply(null, actions.map(a => a.rating));
    return ratingMax - 3; 
};

Game_Battler.prototype.updatePursuedAction = function() {
    let target = this.topAggroBattler();

    if (this._pursuedAction) this._pursuedActionCount++;

    if (this.hasAction()) {
        this.character.turnTowardCharacter(target.character);
        if (this.currentAction().isChanneled() && !this.meetsActionSustainCondition(this.currentAction())) {
            this.clearAction();
        }
        return;
    }
    
    if (!this._pursuedAction) return;
    
    const action = new Game_ActionABS(this, this._pursuedAction);

    if (action.isForOpponent()) {
        if (!target) return;

        if (this.character.distanceBetween(target.character) <= action.range()) {
            const battlers = action.determineTargets();
            if (battlers.includes(target)) return this.setAction(this._pursuedAction);
        }
    } else if (action.isForFriend()) {
        if (this.meetsActionSustainCondition(action)) return this.setAction(this._pursuedAction);
    }

    if (target) this.character.moveTowardCharacter(target.character);
};

Game_Battler.prototype.meetsActionSustainCondition = function(action) {
    if (this._pursuedActionCount >= this.pursuedActionCountLimit(action)) return false;
    if (action.isGuard()) {
        return this.hasAggro() && this.isEnemyUnitWithinRange(this.rangeToGuardWithin());
    }
    return true;
};

const _Game_Battler_onTurnEnd = Game_Battler.prototype.onTurnEnd;
Game_Battler.prototype.onTurnEnd = function() {
    this._internalTurnCount++;
    _Game_Battler_onTurnEnd.call(this);
};

Game_Battler.prototype.moveTowardsTarget = function(target, action) {
    if (this.character.distanceBetween(target.character) <= action.range()) {
        const battlers = action.determineTargets();
        if (battlers.includes(target)) return true;
    }
    this.character.moveTowardCharacter(target.character);
    return false;
};

Game_Battler.prototype.attackAnimationId1 = function() {
    return 1;
};

Game_Battler.prototype.die = function() {
    Game_BattlerBase.prototype.die.call(this);
    this.clearAction();
};

Game_Battler.prototype.setLatestDamageForGauge = function(damage, duration) {
    this.latestDamageForGauge = damage;
    this._latestDamageForGaugeDuration = duration;
};

Game_Battler.prototype.rangeToGuardWithin = function() {
    return 2;
};

Game_Battler.prototype.isEnemyUnitWithinRange = function(range) {
    return this.opponentsUnit().members().some(battler => 
        battler.character && this.character.distanceBetween(battler.character) <= range
    );
};

Game_Battler.prototype.pursuedActionCountLimit = function(action) {
    if (action.isGuard()) return 300;
    return Infinity;
};

Game_Battler.prototype.updateOnTickStateRegen = function(dataId, nonZeroRegenCallback) {
    for (const state of this.states()) {
        if (!this.isStateTurnTick(state.id)) return;
        
        const stateRegen = state.traits.reduce((acc, trait) => {
            if (trait.code === Game_BattlerBase.TRAIT_XPARAM && trait.dataId === dataId) {
                return acc + trait.value;
            }
            return acc;
        }, 0);
        if (stateRegen !== 0) nonZeroRegenCallback(stateRegen);
    }
};

const _Game_Battler_regenerateHp = Game_Battler.prototype.regenerateHp;
Game_Battler.prototype.regenerateHp = function() {
    if (this.isInternalTurnTick()) _Game_Battler_regenerateHp.call(this);
    this.updateOnTickStateRegen(Game_BattlerBase.HRG_DATA_ID, stateHrg => {
        // from Game_Battler.regenerateHp()
        var value = Math.floor(this.mhp * stateHrg);
        value = Math.max(value, -this.maxSlipDamage());
        if (value !== 0) {
            this.gainHp(value);
        }
    });
};

const _Game_Battler_regenerateMp = Game_Battler.prototype.regenerateMp;
Game_Battler.prototype.regenerateMp = function() {
    if (this.isInternalTurnTick()) _Game_Battler_regenerateMp.call(this);
    this.updateOnTickStateRegen(Game_BattlerBase.MRG_DATA_ID, stateMrg => {
        // from Game_Battler.regenerateMp()
        var value = Math.floor(this.mmp * stateMrg);
        if (value !== 0) {
            this.gainMp(value);
        }
    });
};

const _Game_Battler_regenerateTp = Game_Battler.prototype.regenerateTp;
Game_Battler.prototype.regenerateTp = function() {
    if (this.isInternalTurnTick()) _Game_Battler_regenerateTp.call(this);
    this.updateOnTickStateRegen(Game_BattlerBase.TRG_DATA_ID, stateTrg => {
        // from Game_Battler.regenerateTp()
        var value = Math.floor(100 * stateTrg);
        this.gainSilentTp(value);
    });
};