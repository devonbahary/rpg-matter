//-----------------------------------------------------------------------------
// Game_Battler
//
// The superclass of Game_Actor and Game_Enemy. It contains methods for sprites
// and actions.

import Game_ActionABS from "./Game_ActionABS";

Object.defineProperties(Game_Battler.prototype, {
    actionSequence: { get: function() { return this.action.actionSequence(); }, configurable: false },
    weaponIconIndex: { get: function() { return 0; }, configurable: false },
});

const _Game_Battler_initMembers = Game_Battler.prototype.initMembers;
Game_Battler.prototype.initMembers = function() {
    _Game_Battler_initMembers.call(this);
    this.clearAction();
};

Game_Battler.prototype.clearAction = function() {
    this.action = null;
    this._actionFrame = 0;
    this._lastActionFrame = 0;
};

// overwrite
Game_Battler.prototype.setAction = function(action) { 
    this.clearAction();
    this.action = new Game_ActionABS(this, action);
};

Game_Battler.prototype.hasAction = function() {
    return !!this.action;
};

Game_Battler.prototype.update = function() {
    Game_BattlerBase.prototype.update.call(this);
    this.updateActionSeq();
};

Game_Battler.prototype.updateActionSeq = function() {
    this._lastActionFrame = Math.floor(this._actionFrame);
    this._actionFrame += this.actionFrameProgressRate(); 
};

Game_Battler.prototype.actionFrameProgressRate = function() {
    return 1; // TODO: apply speed to this
};

Game_Battler.prototype.actionSequenceCommandsThisFrame = function() {
    const commands = [];
    // action frames can progress slower or faster than 1 per frame
    for (let i = Math.floor(this._lastActionFrame) + 1; i <= Math.floor(this._actionFrame); i++) {
        if (this.actionSequence[i]) commands.push(...this.actionSequence[i]);
    }
    return commands;
}; 