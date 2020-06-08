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

Game_ActionABS.prototype = Object.create(Game_Action.prototype);
Game_ActionABS.prototype.constructor = Game_ActionABS;

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
    if (!targets.length && this.isPhysical()) return this.playMissSe();

    if (this.item().damage.type > 0) {
        for (const target of targets) {
            const critical = (Math.random() < this.itemCri(target));
            const value = this.makeDamageValue(target, critical);
            this.executeDamage(target, value);
            
            this.applyGuardInteraction(target);
            this.applyHitStun(target);
            this.applyAggro(target, value);
            this.applyAnimation(target);
        }
    }
    
    for (const target of targets) {
        this.item().effects.forEach(function(effect) {
            this.applyItemEffect(target, effect);
        }, this);
        this.applyItemUserEffect(target); // TODO: do we want to apply item user effect for EACH target affected?
    }
};

Game_ActionABS.prototype.applyGuardInteraction = function(target) {
    if (!target.isGuard()) this.applyForce(target);
    else this._subject.setAction($dataSkills[MATTER_ABS.DEFLECT_SKILL_ID]);
};

Game_ActionABS.prototype.applyHitStun = function(target) {
    if (!target.isGuard()) target.applyHitStun(this.hitStun());
};

Game_ActionABS.prototype.applyAggro = function(target, value) {
    target.gainAggro(this._subject, value + this.hitStun());
};

Game_ActionABS.prototype.applyAnimation = function(target) {
    if (target.isGuard()) return target.character.requestAnimation(MATTER_ABS.GUARD_ANIMATION_ID);
    target.character.requestAnimation(this.animationId());
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
    if (this.isForUser()) return [ this._subject ];

    const bounds = this._subject.character.squareInFrontOf(this.range());
    const battlersInRange = $gameMap.battlersInBoundingBox(bounds);

    if (this.isForOpponent()) {
        return battlersInRange.filter(battler => !this._subject.isFriendWith(battler) && battler.isAlive());
    } else if (this.isForFriend()) {
        return battlersInRange.filter(battler => this._subject.isFriendWith(battler) && battler.isAlive());
    }

    return battlersInRange;
};

Game_ActionABS.prototype.isChanneled = function() {
    return this._item.isChanneled();
};

Game_ActionABS.prototype.applyGuard = function(damage, target) {
    return damage > 0 && target.isGuard() ? 0 : damage;
};

const _Game_ActionABS_executeHpDamage = Game_ActionABS.prototype.executeHpDamage;
Game_ActionABS.prototype.executeHpDamage = function(target, value) {
    _Game_ActionABS_executeHpDamage.call(this, target, value);
    if (target.character === $gamePlayer && value > 0) this.onPlayerDamage(value);
};

Game_ActionABS.prototype.onPlayerDamage = function(value) {
    const isGuard = $gamePlayer.battler.isGuard();
    const guardScreenEffectMult = isGuard ? MATTER_ABS.GUARD_SCREEN_EFFECTS_MULT : 1;
    
    const intensity = value / $gamePlayer.battler.mhp * guardScreenEffectMult;
    const power = 9 * intensity;
    const speed = 9 * intensity;
    const duration = this.hitStun() * guardScreenEffectMult;
    
    $gameScreen.startShake(power, speed, duration);
    
    if (isGuard) return;

    const color = [ 255, 0, 0, 255 * intensity ];
    $gameScreen.startFlash(color, duration);
};

global["Game_ActionABS"] = Game_ActionABS;