//-----------------------------------------------------------------------------
// Game_ActionABS
//
// The game object class for a battle action in the ABS context.

import { Body, Vector } from "matter-js";
import { vectorFromAToB } from "../../matter-core/utils/vector";
import MATTER_ABS from "../MatterActionBattleSystem";

function Game_ActionABS() {
    this.initialize.apply(this, arguments);
}

Object.defineProperties(Game_ActionABS.prototype, {
    weapon: { get: function() { return this._subject.weapon; }, configurable: false },
});

Game_ActionABS.prototype.initialize = function(subject, action) {
    this._subject = subject;
    this._item = new Game_Item();
    this._item.setObject(action);
};

Game_ActionABS.BASE_FORCE_MULT = 1 / 16; 

Game_ActionABS.prototype.subject = function() {
    return this._subject;
};

Game_ActionABS.prototype.actionSequence = function() {
    return this._item.actionSequence();
};

Game_ActionABS.prototype.actionSequenceLength = function() {
    if (!this.actionSequence()) return 0;
    return Object.keys(this.actionSequence()).reduce((len, key) => {
        if (parseInt(key) > len) return parseInt(key);
        return len;
    }, 0);
};

Game_ActionABS.prototype.apply = function() {
    const targets = this.determineTargets();
    if (!targets.length && this.isAttack()) return this.playMissSe();

    if (this.item().damage.type > 0) {
        for (const target of targets) {
            const critical = (Math.random() < this.itemCri(target));
            const value = this.makeDamageValue(target, critical);
            this.executeDamage(target, value);
            target.character.requestAnimation(this.animationId());
            this.applyForce(target);
        }
    }
    // TODO
    // this.item().effects.forEach(function(effect) {
    //     this.applyItemEffect(target, effect);
    // }, this);
    // this.applyItemUserEffect(target);
};

Game_ActionABS.prototype.playMissSe = function() {
    AudioManager.playSe(MATTER_ABS.NORMAL_ATTACK_MISS_SE);
};

Game_ActionABS.prototype.animationId = function() {
    const animationId = this._item.object().animationId;
    if (animationId < 0) return this._subject.attackAnimationId1();
    return animationId;
};

Game_ActionABS.prototype.applyForce = function(target) {
    const subjectPosition = this._subject.character.body.position;
    const targetBody = target.character.body;

    const directionalVector = vectorFromAToB(subjectPosition, targetBody.position);
    const normalDirectionalVector = Vector.normalise(directionalVector);
    const forceVector = Vector.mult(normalDirectionalVector, this.forceMagnitude() * Game_ActionABS.BASE_FORCE_MULT);
    
    Body.applyForce(targetBody, subjectPosition, forceVector);
};

Game_ActionABS.prototype.forceMagnitude = function() {
    // TODO: isPhysical to use subjectMass multiplier, isMagical to use fixed forces?
    const subjectMass = this._subject.character.body.mass;
    if (this.shouldUseWeaponProperty()) return subjectMass * this.weapon.forceMagnitude();
    return subjectMass * this._item.forceMagnitude();
};

Game_ActionABS.prototype.range = function() {
    if (this.shouldUseWeaponProperty()) return this.weapon.range();
    return this._item.range();
};

Game_ActionABS.prototype.hitStun = function() {
    if (this.shouldUseWeaponProperty()) return this.weapon.hitStun();
    return this._item.hitStun();
};

Game_ActionABS.prototype.shouldUseWeaponProperty = function() {
    return this.isAttack() && this.weapon;
};

Game_ActionABS.prototype.determineTargets = function() {
    const bounds = this._subject.character.squareInFrontOf(this.range());
    const battlersInRange = $gameMap.battlersInBoundingBox(bounds);

    if (this.isForOpponent()) {
        return battlersInRange.filter(battler => !this._subject.isFriendWith(battler) && battler.isAlive());
    } else if (this.isForFriend()) {
        return battlersInRange.filter(battler => this._subject.isFriendWith(battler) && battler.isAlive());
    }

    return battlersInRange;
};

Game_ActionABS.prototype.item = function() {
    return Game_Action.prototype.item.call(this);
};

Game_ActionABS.prototype.checkItemScope = function(list) {
    return Game_Action.prototype.checkItemScope.call(this, list);
};

Game_ActionABS.prototype.isForOpponent = function() {
    return Game_Action.prototype.isForOpponent.call(this);
};

Game_ActionABS.prototype.isForFriend = function() {
    return Game_Action.prototype.isForFriend.call(this);
};

Game_ActionABS.prototype.isForDeadFriend = function() {
    return Game_Action.prototype.isForDeadFriend.call(this);
};

Game_ActionABS.prototype.isForUser = function() {
    return Game_Action.prototype.isForUser.call(this);
};

Game_ActionABS.prototype.isForOne = function() {
    return Game_Action.prototype.isForOne.call(this);
};

Game_ActionABS.prototype.isForRandom = function() {
    return Game_Action.prototype.isForRandom.call(this);
};

Game_ActionABS.prototype.isForAll = function() {
    return Game_Action.prototype.isForAll.call(this);
};

Game_ActionABS.prototype.checkDamageType = function(list) {
    return Game_Action.prototype.checkDamageType.call(this, list);
};

Game_ActionABS.prototype.isHpEffect = function() {
    return Game_Action.prototype.isHpEffect.call(this);
};

Game_ActionABS.prototype.isMpEffect = function() {
    return Game_Action.prototype.isMpEffect.call(this);
};

Game_ActionABS.prototype.isDamage = function() {
    return Game_Action.prototype.isDamage.call(this);
};

Game_ActionABS.prototype.isRecover = function() {
    return Game_Action.prototype.isRecover.call(this);
};

Game_ActionABS.prototype.isDrain = function() {
    return Game_Action.prototype.isDrain.call(this);
};

Game_ActionABS.prototype.isHpRecover = function() {
    return Game_Action.prototype.isHpRecover.call(this);
};

Game_ActionABS.prototype.isMpRecover = function() {
    return Game_Action.prototype.isMpRecover.call(this);
};

Game_ActionABS.prototype.isCertainHit = function() {
    return Game_Action.prototype.isCertainHit.call(this);
};

Game_ActionABS.prototype.isPhysical = function() {
    return Game_Action.prototype.isPhysical.call(this);
};

Game_ActionABS.prototype.isMagical = function() {
    return Game_Action.prototype.isPhysical.call(this);
};

Game_ActionABS.prototype.isAttack = function() {
    return Game_Action.prototype.isAttack.call(this);
};

Game_ActionABS.prototype.isGuard = function() {
    return Game_Action.prototype.isGuard.call(this);
};

Game_ActionABS.prototype.isMagicSkill = function() {
    return Game_Action.prototype.isMagicSkill.call(this);
};

Game_ActionABS.prototype.itemCri = function(target) {
    return Game_Action.prototype.itemCri.call(this, target);
};

Game_ActionABS.prototype.makeDamageValue = function(target, critical) {
    return Game_Action.prototype.makeDamageValue.call(this, target, critical);
};

Game_ActionABS.prototype.evalDamageFormula = function(target) {
    return Game_Action.prototype.evalDamageFormula.call(this, target);
};

Game_ActionABS.prototype.calcElementRate = function(target) {
    return Game_Action.prototype.calcElementRate.call(this, target);
};

Game_ActionABS.prototype.elementsMaxRate = function(target, elements) {
    return Game_Action.prototype.elementsMaxRate.call(this, target, elements);
};

Game_ActionABS.prototype.applyCritical = function(damage) {
    return Game_Action.prototype.applyCritical.call(this, damage);
};

Game_ActionABS.prototype.applyVariance = function(damage, variance) {
    return Game_Action.prototype.applyVariance.call(this, damage, variance);
};

Game_ActionABS.prototype.applyGuard = function(damage, target) {
    return Game_Action.prototype.applyGuard.call(this, damage, target);
};

Game_ActionABS.prototype.executeDamage = function(target, value) {
    // important to apply effects that reset after death prior to executeDamage()
    const hitStun = this.hitStun();
    target.gainAggro(this._subject, value); 
    target.applyHitStun(hitStun);
    Game_Action.prototype.executeDamage.call(this, target, value);
    if (target.character === $gamePlayer && value > 0) this.onPlayerDamage(value, hitStun);
};

Game_ActionABS.prototype.onPlayerDamage = function(value, hitStun) {
    const intensity = value / $gamePlayer.battler.mhp;
    
    const power = 9 * intensity;
    const speed = 9 * intensity;
    const duration = hitStun;
    $gameScreen.startShake(power, speed, duration);
    
    const color = [ 255, 0, 0, 255 * intensity ];
    $gameScreen.startFlash(color, duration);
};

Game_ActionABS.prototype.executeHpDamage = function(target, value) {
    return Game_Action.prototype.executeHpDamage.call(this, target, value);
};

Game_ActionABS.prototype.executeMpDamage = function(target, value) {
    return Game_Action.prototype.executeMpDamage.call(this, target, value);
};

Game_ActionABS.prototype.gainDrainedHp = function(value) {
    return Game_Action.prototype.gainDrainedHp.call(this, value);
};

Game_ActionABS.prototype.gainDrainedMp = function(value) {
    return Game_Action.prototype.gainDrainedMp.call(this, value);
};

Game_ActionABS.prototype.makeSuccess = function() {
};

export default Game_ActionABS;