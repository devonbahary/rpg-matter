//-----------------------------------------------------------------------------
// Game_Player
//
// The game object class for the player. It contains event starting
// determinants and map scrolling functions.

import MATTER_ABS from "../MatterActionBattleSystem";

const _Game_Player_initMembers = Game_Player.prototype.initMembers;
Game_Player.prototype.initMembers = function() {
    _Game_Player_initMembers.call(this);
    this.clearTargetSelection();
};

Game_Player.prototype.setTargetSelectionTargets = function(targets, applyCallback) {
    this.playTargetSelectionSe();
    this._targetSelectionTargets = targets.sort((a, b) => a.character.distanceFrom(this) - b.character.distanceFrom(this));
    this._targetSelectionApplyCallback = applyCallback;
    this.targetSelection = this._targetSelectionTargets[0];
};

Game_Player.prototype.clearTargetSelection = function() {
    this._targetSelectionTargets = [];
    this._targetSelectionApplyCallback = null;
    this.targetSelection = null;
};

const _Game_Player_refresh = Game_Player.prototype.refresh;
Game_Player.prototype.refresh = function() {
    _Game_Player_refresh.call(this);
    // TODO: revisit
    $gameParty.members().forEach(actor => { delete $gameParty._idToBattlerMap[actor.id]; });
    const leader = $gameParty.leader();
    this.setBattler(leader);
    if (leader) $gameParty.addBattler(leader);
};

const _Game_Player_update = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive) {
    if ($gameMap.isSelectionMode) {
        if (this.targetSelection) this.updateSelection();
        return;
    }
    _Game_Player_update.call(this, sceneActive);
};

Game_Player.prototype.updateSelection = function() {
    if (Input.isTriggered('tab')) {
        this.playTargetSelectionSe();
        let nextTargetIndex = this._targetSelectionTargets.findIndex(target => target === this.targetSelection) + 1;
        if (nextTargetIndex >= this._targetSelectionTargets.length) nextTargetIndex = 0;
        this.targetSelection = this._targetSelectionTargets[nextTargetIndex];
    } else if (Input.isTriggered('ok')) {
        this.playTargetSelectionSe();
        this.turnTowardCharacter(this.targetSelection.character);
        $gameMap.setSelectionMode(false);
        this._targetSelectionApplyCallback(this.targetSelection);
        this.clearTargetSelection();
    } 
};

Game_Player.prototype.playTargetSelectionSe = function() {
    SoundManager.playCursor();
};

const _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
Game_Player.prototype.moveByInput = function() {
    if (!this.canMove()) return;

    if (this.hasActionSequence()) {
        const direction = this.getInputDirection();
        this.updateMovementDirection(direction);
    } else {
        _Game_Player_moveByInput.call(this);
    }
};

const _Game_Player_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function() {
    return _Game_Player_canMove.call(this) && !this.isHitStopped();
};

Game_Player.KEY_NAME_TO_ACTION_SLOT_INDEX_MAP = {
    'S': 0,
    'A': 1,
    'Q': 2,
    'W': 3,
    'E': 4,
};

const _Game_Player_triggerButtonAction = Game_Player.prototype.triggerButtonAction;
Game_Player.prototype.triggerButtonAction = function() {
    _Game_Player_triggerButtonAction.call(this);
    if (!$gameMap.isEventRunning()) this.triggerButtonActionABS();
};

Game_Player.prototype.triggerButtonActionABS = function() {
    if (!this.battler.hasAction() || (Input.isPressed('shift') && this.battler.currentAction().canGuardCancel())) {
        // interrupt action for guard
        if (Input.isPressed('shift')) {
            
            if (Input.isDoubleTapped('down')) return this.setDodgeAction();
            if (Input.isDoubleTapped('left')) return this.setDodgeAction();
            if (Input.isDoubleTapped('right')) return this.setDodgeAction();
            if (Input.isDoubleTapped('up')) return this.setDodgeAction();

            if (this.battler.hasAction() && this.battler.currentAction().isGuard()) return;
            return this.battler.setAction($dataSkills[this.battler.guardSkillId()]);
        }

        if (Input.isTriggered('D')) return this.battler.setAction($dataSkills[this.battler.attackSkillId()]);

        for (const keyName of Object.keys(Game_Player.KEY_NAME_TO_ACTION_SLOT_INDEX_MAP)) {
            this.triggerActionSlotForKeyName(keyName);
        }
    } else if (this.battler.isChanneling()) {
        if (this.battler.currentAction().isGuard() && !Input.isPressed('shift')) return this.battler.clearAction();
        for (const keyName of Object.keys(Game_Player.KEY_NAME_TO_ACTION_SLOT_INDEX_MAP)) {
            this.updateChanneledActionForKeyName(keyName);
        }
    }
};

Game_Player.prototype.setDodgeAction = function() {
    this.battler.setAction($dataSkills[MATTER_ABS.DODGE_SKILL_ID]);
};

Game_Player.prototype.triggerActionSlotForKeyName = function(keyName) {
    const actionSlotIndex = Game_Player.KEY_NAME_TO_ACTION_SLOT_INDEX_MAP[keyName];
    if (Input.isTriggered(keyName)) return this.battler.setActionBySlot(actionSlotIndex);
};

Game_Player.prototype.updateChanneledActionForKeyName = function(keyName) {
    if (!this.battler.hasAction()) return;
    const index = Game_Player.KEY_NAME_TO_ACTION_SLOT_INDEX_MAP[keyName];
    const action = this.battler.actionSlots[index];
    if (!action) return;
    if (action.isSameAs(this.battler.currentAction()._item) && !Input.isPressed(keyName)) {
        this.battler.clearAction();
    }
};

Game_Player.prototype.startPlayerSelection = function(targets) {
    if (!targets.length) return;
    this.setTargetSelectionTargets(targets, target => this.battler.currentAction().apply(target));
    $gameMap.setSelectionMode(true);
};