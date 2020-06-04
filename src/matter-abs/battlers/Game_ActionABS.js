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
            
            if (!target.isGuard()) this.applyForce(target);

            const hitStun = this.hitStun();
            target.applyHitStun(hitStun);
            target.gainAggro(this._subject, value + hitStun); 
            
            if (target.isGuard()) {
                target.character.requestAnimation(MATTER_ABS.GUARD_ANIMATION_ID);
            } else {
                target.character.requestAnimation(this.animationId());
            }
        }
    }
    
    for (const target of targets) {
        this.item().effects.forEach(function(effect) {
            this.applyItemEffect(target, effect);
        }, this);
        this.applyItemUserEffect(target); // TODO: do we want to apply item user effect for EACH target affected?
    }
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

Game_ActionABS.prototype.executeDamage = function(target, value) {
    // important to apply effects that reset after death prior to executeDamage()
    Game_Action.prototype.executeDamage.call(this, target, value);
    if (target.character === $gamePlayer && value > 0) this.onPlayerDamage(value);
};

Game_ActionABS.prototype.onPlayerDamage = function(value) {
    const intensity = value / $gamePlayer.battler.mhp;
    
    const power = 9 * intensity;
    const speed = 9 * intensity;
    const duration = this.hitStun();
    $gameScreen.startShake(power, speed, duration);
    
    const color = [ 255, 0, 0, 255 * intensity ];
    $gameScreen.startFlash(color, duration);
};

export default Game_ActionABS;