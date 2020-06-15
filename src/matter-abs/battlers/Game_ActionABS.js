//-----------------------------------------------------------------------------
// Game_ActionABS
//
// The game object class for a battle action in the ABS context.

import { vectorFromAToB, vectorResize } from "../../matter-core/utils/vector";
import MATTER_ABS from "../MatterActionBattleSystem";

function Game_ActionABS() {
    this.initialize.apply(this, arguments);
}

Game_ActionABS.prototype = Object.create(Game_Action.prototype);
Game_ActionABS.prototype.constructor = Game_ActionABS;

Object.defineProperties(Game_ActionABS.prototype, {
    directionFix: { get: function() { 
        const directionFix = this._item.meta.directionFix;
        if (directionFix) return Boolean(JSON.parse(directionFix));
        return false; 
    }, configurable: false },
    imageName: { get: function() { return this._item.meta.characterName; }, configurable: false },
    imageIndex: { get: function() { return parseInt(this._item.meta.characterIndex) || 0; }, configurable: false },
    stepAnime: { get: function() { 
        const isStepAnime = this._item.meta.stepAnime;
        if (isStepAnime) return Boolean(JSON.parse(isStepAnime));
        return false;
    }, configurable: false },
    through: { get: function() { 
        const isThrough = this._item.meta.through;
        if (isThrough) return Boolean(JSON.parse(isThrough));
        return false;
    }, configurable: false },
    weapon: { get: function() { return this._subject.weapon; }, configurable: false },
});

Game_ActionABS.prototype.initialize = function(subject, action) {
    this._subject = subject;
    this._subjectCharacter = subject.character; // sometimes a projectile of subject and not the subject character
    this._item = new Game_Item();
    this._item.setObject(action);
};

Game_ActionABS.BASE_FORCE_MULT = 1 / 16; 

Game_ActionABS.prototype.subject = function() {
    return this._subject;
};

Game_ActionABS.prototype.setSubjectCharacter = function(character) {
    return this._subjectCharacter = character;
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

            const subjectEffectCallbacks = this.subjectEffectCallbacks(target);
            const targetEffectCallbacks = this.targetEffectCallbacks(target, value);
            
            if (target.isGuard()) {
                target.character.requestWeaponAnimation(MATTER_ABS.GUARD_ANIMATION_ID);
            } else {
                target.character.requestAnimation(this.animationId());
            }

            this.executeDamage(target, value);
            target.gainAggro(this._subject, value + this.hitStun());
            
            const hitStop = this.hitStop(critical);

            if (hitStop) {
                this._subject.applyHitStop(hitStop, subjectEffectCallbacks);
                target.applyHitStop(hitStop, targetEffectCallbacks, true);
                $gameMap.setHitStopZoomTarget(target.character, this.hitStopZoomScale());
            } else {
                for (const cb of subjectEffectCallbacks) cb();
                for (const cb of targetEffectCallbacks) cb();
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

Game_ActionABS.prototype.subjectEffectCallbacks = function(target) {
    if (!target.isGuard()) return [];
    return [
        () => this._subject.setAction($dataSkills[MATTER_ABS.DEFLECT_SKILL_ID]),
    ];
};

Game_ActionABS.prototype.targetEffectCallbacks = function(target, value) {
    const isPlayer = target.character === $gamePlayer;
    const isGuard = target.isGuard();
    return [
        () => isPlayer ? this.onPlayerDamage(value) : null,
        () => !isGuard ? this.applyForce(target) : null, 
        () => target.applyHitStun(this.hitStun()),
    ];
};

const _Game_ActionABS_executeHpDamage = Game_ActionABS.prototype.executeHpDamage;
Game_ActionABS.prototype.executeHpDamage = function(target, value) {
    const damageAfterGuard = this.damageAfterGuard(target, value);
    _Game_ActionABS_executeHpDamage.call(this, target, damageAfterGuard);
    target.setLatestDamageForGauge(damageAfterGuard, this.latestDamageForGaugeDuration());
};

Game_ActionABS.prototype.damageAfterGuard = function(target, damage) {
    return Math.round(damage / (damage > 0 && target.isGuard() ? 2 * target.grd : 1)); // from Game_Action.applyGuard()
};

Game_ActionABS.prototype.hitStop = function(critical) {
    const baseHitStop = this._item.hitStop();
    if (critical) return baseHitStop + MATTER_ABS.CRITICAL_HIT_STOP;
    return baseHitStop;
};

Game_ActionABS.prototype.hitStopZoomScale = function() {
    const hitStopZoomScale = this._item.hitStopZoomScale();
    if (hitStopZoomScale) return hitStopZoomScale;
    return MATTER_ABS.HIT_STOP_ZOOM.SCALE;
};

Game_ActionABS.prototype.latestDamageForGaugeDuration = function() {
    if (this.hitStop()) return this.hitStop();
    return MATTER_ABS.GAUGE_LATEST_DAMAGE_DURATION;
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
    const directionalVector = vectorFromAToB(this._subjectCharacter.bodyPos, target.character.bodyPos);
    const forceVector = vectorResize(directionalVector, this.forceMagnitude() * Game_ActionABS.BASE_FORCE_MULT);
    
    target.character.applyForce(forceVector, this._subjectCharacter);
};

Game_ActionABS.prototype.forceMagnitude = function() {
    // TODO: isPhysical to use subjectMass multiplier, isMagical to use fixed forces?
    const subjectMass = this._subjectCharacter.body.mass;
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

Game_ActionABS.prototype.hitStunResist = function() {
    return this._item.hitStunResist();
};

Game_ActionABS.prototype.shouldUseWeaponProperty = function() {
    return this.isAttack() && this.weapon;
};

Game_ActionABS.prototype.determineTargets = function() {
    if (this.isForUser()) return [ this._subject ];

    const bounds = this._subjectCharacter.squareInFrontOf(this.range());
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

Game_ActionABS.prototype.applyGuard = function(damage, target) {
    // overwrite; applyGuard does not return the transformed damage anymore because
    // we need to account for the difference outside of makeDamageValue()
    return damage;
};

Game_ActionABS.prototype.canGuardCancel = function() {
    if (this.isGuard()) return true;
    return this._item.canGuardCancel();
};

Game_ActionABS.prototype.onPlayerDamage = function(value) {
    if (value <= 0) return;

    const isGuard = $gamePlayer.battler.isGuard();
    const guardScreenEffectMult = isGuard ? MATTER_ABS.GUARD_SCREEN_EFFECTS_MULT : 1;
    
    const intensity = Math.abs(value) / $gamePlayer.battler.mhp * guardScreenEffectMult;
    const power = 9 * intensity;
    const speed = 9 * intensity;
    const duration = Math.max(this.hitStun() * guardScreenEffectMult, 5);
    
    $gameScreen.startShake(power, speed, duration);
    
    if (isGuard) return;

    const color = [ 255, 0, 0, 255 * intensity ];
    $gameScreen.startFlash(color, duration);
};

Game_ActionABS.prototype.projectileCharacter = function() {
    return new Game_Projectile(this._subject, this);
};

Game_ActionABS.prototype.hasProjectile = function() {
    return this._item.isProjectile();
};

Game_ActionABS.prototype.projectileForce = function() {
    return this._item.projectileForce();
};

global["Game_ActionABS"] = Game_ActionABS;