//-----------------------------------------------------------------------------
// Game_Battler
//
// The superclass of Game_Actor and Game_Enemy. It contains methods for sprites
// and actions.

import { getMassFromMeta, getBooleanFromMeta } from "../../utils";
import MATTER_CORE from "../../matter-core/pluginParams";

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
    this._action = null;
    this._actionFrame = 0;
    this._lastActionFrame = 0;
};

// overwrite
Game_Battler.prototype.setAction = function(action) { 
    this.clearAction();
    this._action = new Game_ActionABS(this, action);
};

Game_Battler.prototype.hasAction = function() {
    return !!this._action;
};

Game_Battler.prototype.update = function() {
    Game_BattlerBase.prototype.update.call(this);
    if (this.hasActionSequence()) {
        this.updateActionSeq();
    } else {
        this.updateBehavior();
    }
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
        let frame = i;
        if (this.isChanneling()) {
            frame = (i % this._action.actionSequenceLength()) + 1; // cycle frames
        }
        if (i === 1 && this.actionSequence[0]) commands.push(...this.actionSequence[0]); // apply 0-frame commands only once
        if (this.actionSequence[frame]) commands.push(...this.actionSequence[frame]);
    }
    return commands;
}; 

Game_Battler.prototype.hasActionSequence = function() {
    return this.hasAction() && this.actionSequence;
};

Game_Battler.prototype.updateBehavior = function() {
    if (this.character === $gamePlayer) return;

    const skill = this.determineActionSkill();
    if (!skill) return;

    const action = new Game_ActionABS(this, skill);

    if (action.isForOpponent()) {
        const target = this.topAggroBattler();
        if (!target) return;

        if (this.character.distanceBetween(target.character) <= action.range()) {
            const battlers = action.determineTargets();
            if (battlers.includes(target)) return this.setAction(skill);
        }
        this.character.moveTowardCharacter(target.character);
    }
};

Game_Battler.prototype.determineActionSkill = function() {
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
    this.resetAggro();
};