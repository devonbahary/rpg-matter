//-----------------------------------------------------------------------------
// Game_ActionABS
//
// The game object class for a battle action in the ABS context.

import ACTION_SEQUENCES from "../action-sequences";

function Game_ActionABS() {
    this.initialize.apply(this, arguments);
}

Game_ActionABS.prototype.initialize = function(subject, action) {
    this._subject = subject;
    this._action = action;
};

Game_ActionABS.prototype.actionSequence = function() {
    const actionSeq = this._action.meta.actionSeq;
    if (actionSeq && ACTION_SEQUENCES[actionSeq]) return ACTION_SEQUENCES[actionSeq];
    return null;
};

export default Game_ActionABS;