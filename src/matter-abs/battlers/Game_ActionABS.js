//-----------------------------------------------------------------------------
// Game_ActionABS
//
// The game object class for a battle action in the ABS context.

import { vectorFromAToB, vectorResize } from "../../matter-core/utils/vector";
import MATTER_ABS from "../MatterActionBattleSystem";
import { AOE_TYPES } from "../constants";

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
    iconIndex: { get: function() { return parseInt(this._item.meta.iconIndex); }, configurable: false },
    iconRotation: { get: function() { return parseInt(this._item.meta.iconRotation) || 0; }, configurable: false },
    iconRotationSpeed: { get: function() { return parseInt(this._item.meta.iconRotationSpeed) || 0; }, configurable: false },
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
    this._hasAppliedEffect = false; // prevent certain behavior after effect has been applied (e.g., guard cancelling)
};

Game_ActionABS.BASE_FORCE_MULT = 1 / 16; 

Game_ActionABS.prototype.subject = function() {
    return this._subject;
};

Game_ActionABS.prototype.setSubjectCharacter = function(character) {
    return this._subjectCharacter = character;
};

Game_ActionABS.prototype.setHasAppliedEffect = function(hasAppliedEffect) {
    this._hasAppliedEffect = hasAppliedEffect;
};

// overwritten
Game_ActionABS.prototype.setTarget = function(target) {
    // used by needsSelection() actions to indicate the target at the time of setting the action
    // (may not be in the same list as determineTargets() by the time the action is applied)
    this._target = target;
};

Game_ActionABS.prototype.actionSequence = function() {
    return this._item.actionSequence();
};

Game_ActionABS.prototype.actionSequenceLength = function() {
    if (!this.actionSequence()) return 0;
    return Object.keys(this.actionSequence()).reduce((length, key) => {
        if (parseInt(key) > length) return parseInt(key);
        return length;
    }, 0);
};

Game_ActionABS.prototype.apply = function() {
    this.setHasAppliedEffect(true);

    const targets = this.determineTargets();
    
    if (!targets.length) return;

    for (const target of targets) {
        let isCritical, damage = 0;
        if (this.item().damage.type > 0) {
            isCritical = Math.random() < this.itemCri(target);
            damage = this.makeDamageValue(target, isCritical);
        }
    
        const subjectEffectCallbacks = this.subjectEffectCallbacks(target, damage);
        const targetEffectCallbacks = this.targetEffectCallbacks(target, damage);
        
        if (this.shouldApplyGuardedEffects(target, damage)) {
            target.character.requestWeaponAnimation(MATTER_ABS.GUARD_ANIMATION_ID);
            if (this.isMagical()) target.character.requestAnimation(this.animationId());
        } else {
            target.character.requestAnimation(this.animationId());
        }

        this.executeDamage(target, damage);
        target.gainAggro(this._subject, this.aggroForTarget(damage, target));
        
        const hitStop = this.hitStop(isCritical);

        if (hitStop) {
            this._subject.applyHitStop(hitStop, subjectEffectCallbacks);
            target.applyHitStop(hitStop, targetEffectCallbacks, true);
            $gameMap.setHitStopZoomTarget(target.character, this.hitStopZoomScale());
        } else {
            for (const cb of subjectEffectCallbacks) cb();
            for (const cb of targetEffectCallbacks) cb();
        }

        for (const effect of this.item().effects) {
            this.applyItemEffect(target, effect);
        }
        this.applyItemUserEffect(target); // TODO: do we want to apply item user effect for EACH target affected?
    }
};

Game_ActionABS.prototype.subjectEffectCallbacks = function(target, damage) {
    if (!this.shouldApplyGuardedEffectsToUser(target, damage)) return [];
    return [
        () => this._subject.setAction($dataSkills[MATTER_ABS.DEFLECT_SKILL_ID]),
    ];
};

Game_ActionABS.prototype.shouldApplyGuardedEffects = function(target, damage) {
    return this.isForOpponent() && target.isGuard() && damage >= 0 && !this.isGuardBreaking();
};

Game_ActionABS.prototype.shouldApplyGuardedEffectsToUser = function(target, damage) {
    return this.shouldApplyGuardedEffects(target, damage) && this.isPhysical() && !this.isIgnoreGuard();
};

Game_ActionABS.prototype.targetEffectCallbacks = function(target, damage) {
    const isPlayer = target.character === $gamePlayer;
    return [
        () => isPlayer ? this.onPlayerDamage(damage) : null,
        () => this.applyForce(target, damage), 
        () => target.applyHitStun(this.hitStun(target)),
    ];
};

Game_ActionABS.prototype.aggroForTarget = function(damage, target) {
    const baseAggro = this._item.aggro() + damage + this.hitStun(target);
    return baseAggro + 60 * this.item().effects.length;
};

const _Game_ActionABS_executeHpDamage = Game_ActionABS.prototype.executeHpDamage;
Game_ActionABS.prototype.executeHpDamage = function(target, value) {
    const damageAfterGuard = this.damageAfterGuard(target, value);
    _Game_ActionABS_executeHpDamage.call(this, target, damageAfterGuard);
    target.setLatestDamageForGauge(damageAfterGuard, this.latestDamageForGaugeDuration());
    target.requestDamagePopup(damageAfterGuard);
};

Game_ActionABS.prototype.damageAfterGuard = function(target, damage) {
    if (!this.shouldApplyGuardedEffects(target, damage)) return Math.round(damage);
    return Math.round(damage / 2 * target.grd); // from Game_Action.applyGuard()
};

Game_ActionABS.prototype.hitStop = function(isCritical) {
    const baseHitStop = this._item.hitStop();
    if (isCritical) return baseHitStop + MATTER_ABS.CRITICAL_HIT_STOP;
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

Game_ActionABS.prototype.animationId = function() {
    const animationId = this._item.object().animationId;
    if (animationId < 0) return this._subject.attackAnimationId1();
    return animationId;
};

Game_ActionABS.prototype.applyForce = function(target, damage) {
    const directionalVector = vectorFromAToB(this._subjectCharacter.bodyPos, target.character.bodyPos);
    let forceScalar = this.forceMagnitude() * Game_ActionABS.BASE_FORCE_MULT;
    if (this.shouldApplyGuardedEffects(target, damage)) forceScalar /= 2 * target.grd;
    const forceVector = vectorResize(directionalVector, forceScalar);
    
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

Game_ActionABS.prototype.isGuardBreaking = function() {
    return this._item.isGuardBreaking();
};

Game_ActionABS.prototype.isIgnoreGuard = function() {
    return this._item.isIgnoreGuard();
};

Game_ActionABS.prototype.hitStun = function(target) {
    const elementRate = this.calcElementRate(target);
    if (this.shouldUseWeaponProperty()) return elementRate * this.weapon.hitStun();
    return elementRate * this._item.hitStun();
};

Game_ActionABS.prototype.hitStunResist = function() {
    return this._item.hitStunResist();
};

Game_ActionABS.prototype.shouldUseWeaponProperty = function() {
    return this.isAttack() && this.weapon;
};

Game_ActionABS.prototype.determineTargets = function() {
    if (this._target) return [ this._target ];
    
    if (this.isForUser()) return [ this._subject ];

    const battlersInRange = this.battlersInRange();

    if (this.subject().isBlinded() && this.needsSelection()) {
        if (this.isForFriend()) return [ this._subject ];
        return [];
    }

    if (this.isForOpponent()) {
        return battlersInRange.filter(battler => !this._subject.isFriendWith(battler) && battler.isAlive());
    } else if (this.isForFriend()) {
        return battlersInRange.filter(battler => this._subject.isFriendWith(battler) && battler.isAlive());
    }

    return battlersInRange;
};

Game_ActionABS.prototype.battlersInRange = function() {
    let bounds;
    switch (this.aoe()) {
        case AOE_TYPES.RADIUS:
            bounds = this._subjectCharacter.squareAround(this.range() * 2);
            const battlers = $gameMap.battlersInBoundingBox(bounds);
            return battlers.filter(b => {
                return b.character.distanceBetween(this._subjectCharacter) <= this.range();
            });
        case AOE_TYPES.SQUARE: 
        default:
            bounds = this._subjectCharacter.squareInFrontOf(this.range());
            return $gameMap.battlersInBoundingBox(bounds);
    }
};

Game_ActionABS.prototype.aoe = function() {
    return this._item.aoe();
};

Game_ActionABS.prototype.isChanneled = function() {
    return this._item.isChanneled();
};

Game_ActionABS.prototype.applyGuard = function(damage, target) {
    // overwrite; applyGuard does not return the transformed damage anymore because
    // we need to account for the difference outside of makeDamageValue()
    return damage;
};

Game_ActionABS.prototype.canGuardCancel = function() {
    if (this.isGuard()) return true;
    return this._item.canGuardCancel() && !this._hasAppliedEffect;
};

Game_ActionABS.prototype.onPlayerDamage = function(damage) {
    if (damage <= 0) return;

    const isGuard = this.shouldApplyGuardedEffects($gamePlayer.battler, damage);
    const guardScreenEffectMult = isGuard ? MATTER_ABS.GUARD_SCREEN_EFFECTS_MULT : 1;
    
    const intensity = Math.abs(damage) / $gamePlayer.battler.mhp * guardScreenEffectMult;
    const power = 9 * intensity;
    const speed = 9 * intensity;
    const duration = Math.max(this.hitStun($gamePlayer.battler) * guardScreenEffectMult, 5);
    
    $gameScreen.startShake(power, speed, duration);
    
    if (isGuard) return;

    const color = [ 255, 0, 0, 255 * intensity ];
    $gameScreen.startFlash(color, duration);
};

Game_ActionABS.prototype.itemEffectRecoverHp = function(target, effect) {
    const prevTargetHp = target.hp;
    Game_Action.prototype.itemEffectRecoverHp.call(this, target, effect);
    const recoveredHp = prevTargetHp - target.hp;
    target.setLatestDamageForGauge(prevTargetHp - target.hp, this.latestDamageForGaugeDuration());
    if (recoveredHp) target.requestDamagePopup(recoveredHp);
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

Game_ActionABS.prototype.needsPlayerSelection = function() {
    return this.needsSelection() && this.subject().character === $gamePlayer;
};

Game_ActionABS.prototype.cooldown = function() {
    return this._item.cooldown();
};

global["Game_ActionABS"] = Game_ActionABS;