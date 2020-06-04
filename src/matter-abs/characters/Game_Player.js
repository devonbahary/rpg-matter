//-----------------------------------------------------------------------------
// Game_Player
//
// The game object class for the player. It contains event starting
// determinants and map scrolling functions.

const _Game_Player_refresh = Game_Player.prototype.refresh;
Game_Player.prototype.refresh = function() {
    _Game_Player_refresh.call(this);
    // TODO: revisit
    $gameParty.members().forEach(actor => { delete $gameParty._idToBattlerMap[actor.id]; });
    const leader = $gameParty.leader();
    this.setBattler(leader);
    if (leader) $gameParty.addBattler(leader);
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

Game_Player.KEY_NAME_TO_ACTION_SLOT_INDEX_MAP = {
    'ok': 0,
    'D': 0,
    'shift': 1,
    'S': 2,
    'A': 3,
    'Q': 4,
    'W': 5,
    'E': 6,
};

const _Game_Player_triggerButtonAction = Game_Player.prototype.triggerButtonAction;
Game_Player.prototype.triggerButtonAction = function() {
    _Game_Player_triggerButtonAction.call(this);
    
    if ($gameMap.isEventRunning()) return;

    if (!this.battler.hasAction() || Input.isPressed('shift')) {
        // interrupt action for guard
        if (Input.isPressed('shift')) {
            this.battler.clearAction()
            return this.battler.setActionBySlot(1);
        }

        for (const keyName of Object.keys(Game_Player.KEY_NAME_TO_ACTION_SLOT_INDEX_MAP)) {
            this.triggerActionSlotForKeyName(keyName);
        }
    } else if (this.battler.isChanneling()) {
        for (const keyName of Object.keys(Game_Player.KEY_NAME_TO_ACTION_SLOT_INDEX_MAP)) {
            this.endChanneledActionForKeyName(keyName);
        }
    }
};

Game_Player.prototype.triggerActionSlotForKeyName = function(keyName) {
    const actionSlotIndex = Game_Player.KEY_NAME_TO_ACTION_SLOT_INDEX_MAP[keyName];
    if (Input.isPressed(keyName)) return this.battler.setActionBySlot(actionSlotIndex);
};

Game_Player.prototype.endChanneledActionForKeyName = function(keyName) {
    if (!this.battler.hasAction()) return;
    const index = Game_Player.KEY_NAME_TO_ACTION_SLOT_INDEX_MAP[keyName];
    const action = this.battler.actionSlots[index];
    if (action.isSameAs(this.battler.currentAction()._item) && !Input.isPressed(keyName)) {
        this.battler.clearAction();
    }
};