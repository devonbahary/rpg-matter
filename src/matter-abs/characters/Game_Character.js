//-----------------------------------------------------------------------------
// Game_Character
//
// The superclass of Game_Player, Game_Follower, GameVehicle, and Game_Event.

import { WEAPON_POSES } from "../weapon-poses";


Object.defineProperties(Game_CharacterBase.prototype, {
    weaponIconIndex: { get: function() { return this.battler ? this.battler.weaponIconIndex : 0; }, configurable: false },
});

// MOVEMENT
Game_Character.STEP_LOCK               = 400;
Game_Character.STEP_FORWARD            = 401;
Game_Character.STEP_NEUTRAL            = 402;
Game_Character.STEP_BACKWARD           = 403;
// WEAPON POSE
Game_Character.WEAPON_POSE             = 501;
// ANIMATIONS
// BATTLE EFFECTS
Game_Character.APPLY_EFFECT            = 700;

const _Game_Character_initMembers = Game_Character.prototype.initMembers;
Game_Character.prototype.initMembers = function() {
    _Game_Character_initMembers.call(this);
    this.weaponPose = WEAPON_POSES.IDLE;
    this._originalWeaponPose = WEAPON_POSES.IDLE;
    this._stepLock = false;
    this._stepLockMem = false;
    this._hasActionSequenceMem = false;
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
    return !this._stepLock && !this.isHitStunned();
};

const _Game_Character_update = Game_Character.prototype.update;
Game_Character.prototype.update = function() {
    this.updateHitStun();
    this.updateActionSequence();
    _Game_Character_update.call(this);
};

const _Game_Character_move = Game_Character.prototype.move;
Game_Character.prototype.move = function(vector) {
    if (!this.isHitStunned()) _Game_Character_move.call(this, vector);
};

Game_Character.prototype.updateHitStun = function() {
    if (this.isHitStunned()) this.stepBackward();
};

Game_Character.prototype.updateActionSequence = function() {
    if (!this.hasActionSequence()) {
        if (this._hasActionSequenceMem) this.onActionSequenceEnd();
    } else {
        if (!this._hasActionSequenceMem) this.onActionSequenceStart();
    
        const commands = this.battler.actionSequenceCommandsThisFrame();
        if (commands.length) {
            for (const command of commands) {
                this.processMoveCommand(command);
            }
        } else if (this.battler.actionSequenceProgressRate() >= 1 && !this.battler.isActionChanneled()) {
            this.onActionSequenceEnd();
        }
    }

    this._hasActionSequenceMem = this.hasActionSequence();
};

Game_Character.prototype.onActionSequenceStart = function() {
    // remember mutable properties of action sequence to restore at end
    this._originalWeaponPose = this.weaponPose;
};

Game_Character.prototype.onActionSequenceEnd = function() {
    if (this.battler) this.battler.clearAction();
    // restore mutable properties of action sequence
    this.weaponPose = this._originalWeaponPose;
    this.stepLock(this._stepLockMem);
};

const _Game_Character_processMoveCommand = Game_Character.prototype.processMoveCommand;
Game_Character.prototype.processMoveCommand = function(command) {
    _Game_Character_processMoveCommand.call(this, command);
    var gc = Game_Character;
    var params = command.parameters;
    switch (command.code) {
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
    case gc.WEAPON_POSE:
        this.weaponPose = params[0];
        break;
    case gc.APPLY_EFFECT:
        this.applyEffect(params[0]);
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
