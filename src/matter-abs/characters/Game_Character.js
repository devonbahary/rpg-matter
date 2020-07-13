//-----------------------------------------------------------------------------
// Game_Character
//
// The superclass of Game_Player, Game_Follower, GameVehicle, and Game_Event.

import { WEAPON_POSES } from "../weapon-poses";
import MATTER_ABS from "../MatterActionBattleSystem";

Object.defineProperties(Game_CharacterBase.prototype, {
    weaponIconIndex: { get: function() { return this.battler ? this.battler.weaponIconIndex : 0; }, configurable: false },
});

// MOVEMENT
Game_Character.STEP_LOCK               = 400;
Game_Character.STEP_FORWARD            = 401;
Game_Character.STEP_NEUTRAL            = 402;
Game_Character.STEP_BACKWARD           = 403;
Game_Character.MOVEMENT_RESTRICT_ON    = 404;
Game_Character.MOVEMENT_RESTRICT_OFF   = 405;
Game_Character.ADD_JUMP                = 406;

// WEAPON POSE
Game_Character.WEAPON_POSE             = 501;
// ANIMATIONS
Game_Character.ANIMATION_SELF          = 600;
Game_Character.ANIMATION_WEAPON        = 601;
// BATTLE EFFECTS
Game_Character.APPLY_EFFECT            = 700;
Game_Character.CREATE_PROJECTILE       = 701;

const _Game_Character_initMembers = Game_Character.prototype.initMembers;
Game_Character.prototype.initMembers = function() {
    _Game_Character_initMembers.call(this);
    this.weaponPose = WEAPON_POSES.IDLE;
    this._originalWeaponPose = WEAPON_POSES.IDLE;
    this.initStepLock();
    this._hasActionSequenceMem = false;
};

Game_Character.prototype.initStepLock = function() {
    this._stepLock = false;
    this._stepLockMem = false;
};

Game_Character.prototype.stepForward = function() {
    if (this.hasWalkAnime()) {
        const pattern = this.direction() === 6 ? 0 : 2;
        this.setPattern(pattern);
    }
};

Game_Character.prototype.stepBackward = function() {
    if (this.hasWalkAnime()) {
        const pattern = this.direction() === 6 ? 2 : 0;
        this.setPattern(pattern);
    }
};

Game_Character.prototype.stepLock = function(lock) {
    this._stepLock = lock;
    if (!this._stepLock) this.setPattern(1);
};

Game_Character.prototype.applyEffect = function() {
    if (!this.battler) return;
    this.battler.currentAction().apply();
};

const _Game_Character_updatePattern = Game_Character.prototype.updatePattern;
Game_Character.prototype.updatePattern = function() {
    if (this.shouldUpdatePattern()) _Game_Character_updatePattern.call(this);
};

Game_Character.prototype.shouldUpdatePattern = function() {
    return !this._stepLock && !this.isHitStunned() && !this.isHitStopped();
};

const _Game_Character_update = Game_Character.prototype.update;
Game_Character.prototype.update = function() {
    this.updateHitStun();
    if (!$gameMessage.isBusy()) {
        this.updateHitStop();
        this.updateActionSequence();
    }
    _Game_Character_update.call(this);
};

const _Game_Character_move = Game_Character.prototype.move;
Game_Character.prototype.move = function(vector) {
    if (this.battler && !this.battler.canMove()) return;
    _Game_Character_move.call(this, vector);
};

Game_Character.prototype.updateHitStun = function() {
    if (this.isHitStunned()) this.stepBackward();
};

Game_CharacterBase.prototype.updateHitStop = function() {
    if (this.isHitStopped() && this.timeScale !== MATTER_ABS.HIT_STOP_TIME_SCALE) {
        this.setTimeScale(MATTER_ABS.HIT_STOP_TIME_SCALE);
    } else if (!this.isHitStopped() && this.timeScale === MATTER_ABS.HIT_STOP_TIME_SCALE) {
        this.setTimeScale(1);
    }
};

Game_Character.prototype.updateActionSequence = function() {
    if (this.isHitStopped()) return;
    if (!this.hasActionSequence()) {
        if (this._hasActionSequenceMem) this.onActionSequenceEnd();
    } else {
        if (!this._hasActionSequenceMem) this.onActionSequenceStart();
    
        const commands = this.battler.actionSequenceCommandsThisFrame();
        if (commands.length) {
            for (const command of commands) {
                this.processMoveCommand(command);
            }
        } else if (this.battler.actionSequenceProgressRate() >= 1 && !this.battler.isChanneling()) {
            this.onActionSequenceEnd();
        }
    }

    this._hasActionSequenceMem = this.hasActionSequence();
};

Game_Character.prototype.onActionSequenceStart = function() {
    // remember mutable properties of action sequence to restore at end
    this._originalWeaponPose = this.weaponPose;
    this._originalDirectionFix = this._directionFix;
};

Game_Character.prototype.onActionSequenceEnd = function() {
    if (this.battler) this.battler.clearAction();
    // restore mutable properties of action sequence
    this.weaponPose = this._originalWeaponPose;
    this._directionFix = this._originalDirectionFix;
    this.stepLock(this._stepLockMem);
    this._jumpHeight = 0;
};

const _Game_Character_processMoveCommand = Game_Character.prototype.processMoveCommand;
Game_Character.prototype.processMoveCommand = function(command) {
    _Game_Character_processMoveCommand.call(this, command);
    var gc = Game_Character;
    var params = command.parameters;
    switch (command.code) {
        // MOVEMENT
        case gc.STEP_LOCK:
            this.stepLock(params[0]);
            break;
        case gc.STEP_FORWARD:
            this.stepForward();
            break;
        case gc.STEP_NEUTRAL:
            this.resetPattern();
            break;
        case gc.STEP_BACKWARD:
            this.stepBackward();
            break;
        case gc.MOVEMENT_RESTRICT_ON:
            this.battler.isMovementRestricted = true;
            break;
        case gc.MOVEMENT_RESTRICT_OFF:
            this.battler.isMovementRestricted = false;
            break;
        case gc.ADD_JUMP:
            this.addJump(params[0]);
            break;
        // WEAPON POSE
        case gc.WEAPON_POSE:
            this.weaponPose = params[0];
            break;
        // ANIMATIONS
        case gc.ANIMATION_SELF:
            this.requestAnimation(params[0], params[1]);
            break;
        case gc.ANIMATION_WEAPON:
            this.requestWeaponAnimation(params[0], params[1]);
            break;
        // BATTLE EFFECTS
        case gc.APPLY_EFFECT:
            this.applyEffect(params[0]);
            break;
        case gc.CREATE_PROJECTILE:
            this.createProjectile();
            break;
    }
};

Game_Character.prototype.setBattler = function(battler) {
    if (!battler && this.battler) this.battler.character = null;
    this.battler = battler;
    if (battler) battler.character = this;
};

Game_Character.prototype.hasActionSequence = function() {
    return this.battler && this.battler.hasActionSequence();
};

Game_Character.prototype.isHitStunned = function() {
    return this.battler && this.battler.isHitStunned();
};

Game_Character.prototype.isHitStopped = function() {
    return this.battler && this.battler.isHitStopped();
};

Game_Character.prototype.isHitStopTarget = function() {
    return this.battler && this.battler.isHitStopTarget();
};

Game_Character.prototype.createProjectile = function() {
    const action = this.battler.currentAction();
    if (!action.hasProjectile()) return;
    
    const projectileCharacter = action.projectileCharacter();
    projectileCharacter.setInFrontOfCharacter(this);
    projectileCharacter.addToScene();
    projectileCharacter.start();

    this.battler.currentAction().setHasAppliedEffect(true);
};