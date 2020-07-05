//-----------------------------------------------------------------------------
// Game_Battler
//
// The superclass of Game_Actor and Game_Enemy. It contains methods for sprites
// and actions.

import BehaviorTree from "../behavior-tree/Root";
import { getMassFromMeta, getBooleanFromMeta } from "../../utils";
import MATTER_CORE from "../../matter-core/pluginParams";
import MATTER_ABS from "../MatterActionBattleSystem";

Object.defineProperties(Game_Battler.prototype, {
    actionSequence: { get: function() { return this._action.actionSequence(); }, configurable: false },
    imageName: { get: function() { return ''; }, configurable: false },
    imageIndex: { get: function() { return 0; }, configurable: false },
    mass: {
        get: function() {
            return getMassFromMeta(this.data.meta.mass) || MATTER_CORE.CHARACTER_DEFAULT_MASS;
        }, configurable: false
    },
    priorityType: { get: function() { return 1; }, configurable: false }, // same as characters
    stepAnime: { get: function() { return getBooleanFromMeta(this.data.meta.stepAnime); }, configurable: false },
    weaponIconIndex: { get: function() { return 0; }, configurable: false },
});

const _Game_Battler_initMembers = Game_Battler.prototype.initMembers;
Game_Battler.prototype.initMembers = function() {
    _Game_Battler_initMembers.call(this);
    this._effectTypeFulfilled = true;
    this.behaviorTree = new BehaviorTree(this);
    this.clearAction();
    this.character = null;
    this.latestDamageForGauge = 0;
    this._damagePopups = [];
    this._internalTurnCount = 0;
    this.resetMentalBattlerMap();
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
    if ($dataStates[stateId].autoRemovalTiming === Game_BattlerBase.AUTO_REMOVAL_TIMINGS.TURN_END) {
        return this._stateTurns[stateId] % MATTER_ABS.BATTLE_FRAMES_IN_TURN === 0;
    }
    return false;
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

const _Game_Battler_addState = Game_Battler.prototype.addState;
Game_Battler.prototype.addState = function(stateId) {
    if (this.isStateAddable(stateId)) {
        if ($dataStates[stateId].meta.blind && this.stateCountWithBlindMeta() === 0 && this.character === $gamePlayer) {
            $gameScreen.startFadeOut(60);
        }
        this.logAddState(stateId);
    }
    _Game_Battler_addState.call(this, stateId);
};

Game_Battler.prototype.logAddState = function(stateId) {
    const state = $dataStates[stateId];
    const { iconIndex, message1: actorMessage, message2: enemyMessage } = state;
    const message = this.isActor() ? actorMessage : enemyMessage;
    if (message) {
        $gameMap.addLog({
            iconIndex,
            message: this.name() + message,
        });
    }
};

const _Game_Battler_removeState = Game_Battler.prototype.removeState;
Game_Battler.prototype.removeState = function(stateId) {
    if (this.isStateAffected(stateId)) {
        this.logRemoveState(stateId);
        if ($dataStates[stateId].meta.blind && this.stateCountWithBlindMeta() === 1) { // only reset if no more states
            this.resetMentalBattlerMap();
            if (this.character === $gamePlayer) $gameScreen.startFadeIn(60);
        }
    }
    _Game_Battler_removeState.call(this, stateId);
};

Game_Battler.prototype.logRemoveState = function(stateId) {
    const state = $dataStates[stateId];
    const { iconIndex, message4: removedMessage } = state;
    if (removedMessage) {
        $gameMap.addLog({
            iconIndex,
            message: this.name() + removedMessage,
        });
    }
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
    this.pursuedAction = null;
    this._pursuedActionCount = 0;
    this._action = null;
    this._actionFrame = 0;
    this._lastActionFrame = 0;
    this.removeStatesAuto(Game_BattlerBase.AUTO_REMOVAL_TIMINGS.ACTION_END);
};

// overwrite
Game_Battler.prototype.setAction = function(dataItem) { 
    if (!this.canUse(dataItem)) return;

    const action = new Game_ActionABS(this, dataItem);
    
    const setActionCallback = () => {
        this.clearAction();
        this.character.clearPathfinding();
        
        this._action = action;
        this.useItem(dataItem);
        
        if (!dataItem.meta.noLog) {
            $gameMap.addLog({
                iconIndex: dataItem.iconIndex,
                message: TextManager.useItem.format(this.name(), dataItem.name),
            });
        }
    };

    if (action.needsPlayerSelection()) {
        const targets = action.determineTargets();
        if (!targets.length) return;

        return $gamePlayer.startTargetSelection(targets, setActionCallback);
    }

    setActionCallback();
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
    this.updateEnemyDetection();
    this.updateMentalBattlerMap();
    this.behaviorTree.tick();
};

Game_Battler.prototype.updateEnemyDetection = function() {
    if (!this.character) return;
    for (const enemy of this.opponentsUnit().aliveMembers()) {
        if (!enemy.character || this._aggro[enemy.id] !== undefined) continue;
        const isWithinAggroDistance = this.character.distanceBetween(enemy.character) <= MATTER_ABS.BATTLER_LINE_OF_SIGHT_DETECTION_RANGE;
        if (this.character.hasLineOfSightTo(enemy.character) && isWithinAggroDistance) {
            this.gainAggro(enemy, 0);            
        }
    }
};

Game_Battler.prototype.updateMentalBattlerMap = function() {
    if (!this.character || this.isBlinded()) return;
    for (const enemy of this.opponentsUnit().aliveMembers()) {
        if (enemy.character && this.character.hasLineOfSightTo(enemy.character)) this.updateMentalBattlerMapForBattler(enemy); 
    }
    for (const friend of this.friendsUnit().aliveMembers()) {
        if (friend === this) continue;
        if (friend.character && this.character.hasLineOfSightTo(friend.character)) this.updateMentalBattlerMapForBattler(friend);
    }
};

Game_Battler.prototype.updateMentalBattlerMapForBattler = function(battler) {
    this._mentalBattlerMap[battler.id] = battler.character.locationData;
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

Game_Battler.prototype.meetsActionSustainCondition = function(action) {
    if (this._pursuedActionCount >= this.pursuedActionCountLimit(action)) return false;
    if (action.isGuard()) {
        return this.hasAggro() && this.isEnemyUnitWithinRange(this.rangeToGuardWithin());
    }
    return true;
};

Game_Battler.prototype.moveTowardTarget = function(target) {
    const battlerCharacter = this.getPerceivedBattlerCharacter(target);
    this.character.moveTowardCharacter(battlerCharacter)
};

Game_Battler.prototype.turnTowardTarget = function(target) {
    const battlerCharacter = this.getPerceivedBattlerCharacter(target);
    this.character.turnTowardCharacter(battlerCharacter);
};

Game_Battler.prototype.hasLineOfSightTo = function(target) {
    const battlerCharacter = this.getPerceivedBattlerCharacter(target);
    return this.character.hasLineOfSightTo(battlerCharacter);
};

Game_Battler.prototype.pathfindToTarget = function(target) {
    const battlerCharacter = this.getPerceivedBattlerCharacter(target);
    this.character.pathfindTo(battlerCharacter, [ target.character ]);
};

const _Game_Battler_onTurnEnd = Game_Battler.prototype.onTurnEnd;
Game_Battler.prototype.onTurnEnd = function() {
    this._internalTurnCount++;
    this.updateOnStateTickAnimations();
    _Game_Battler_onTurnEnd.call(this);
};

Game_Battler.prototype.updateOnStateTickAnimations = function() {
    if (!this.character) return;
    for (const stateId of this._states) {
        if (this.isStateTurnTick(stateId)) {
            const animationId = parseInt($dataStates[stateId].meta.tickAnimationId);
            if (!animationId) continue;
            this.character.requestAnimation(animationId);
        } 
    }
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
        battler.character && this.distanceBetween(battler) <= range
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

Game_Battler.prototype.resetMentalBattlerMap = function() {
    this._mentalBattlerMap = {};
};

Game_Battler.prototype.stateCountWithBlindMeta = function() {
    return this.states().reduce((acc, state) => acc + (state.meta.blind ? 1 : 0), 0);
};

Game_Battler.prototype.isBlinded = function() {
    return this.stateCountWithBlindMeta() > 0;
};

Game_Battler.prototype.gainAggro = function(battler, value) {
    Game_BattlerBase.prototype.gainAggro.call(this, battler, value);
    if (this.shouldGainAggro(battler)) {
        this.updateMentalBattlerMapForBattler(battler);
    }
};

Game_Battler.prototype.getPerceivedBattlerCharacter = function(battler) {
    return this._mentalBattlerMap[battler.id];
};

Game_Battler.prototype.distanceBetween = function(battler) {
    const battlerCharacter = this.getPerceivedBattlerCharacter(battler);
    return this.character.distanceBetween(battlerCharacter);
};

Game_Battler.prototype.isPathfinding = function() {
    return this.character.hasDestination();
};

const _Game_Battler_canUse = Game_Battler.prototype.canUse;
Game_Battler.prototype.canUse = function(item) {
    if (!this.isBlinded()) return _Game_Battler_canUse.call(this, item);
    const action = new Game_ActionABS(this, item);
    return (
        _Game_Battler_canUse.call(this, item) && 
        (!action.needsSelection() || action.isForFriend())
    );
};