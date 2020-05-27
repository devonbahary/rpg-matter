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
    if (actionSeq && ACTION_SEQUENCES[actionSeq]) {
        return ACTION_SEQUENCES[actionSeq];
    } else if (actionSeq && !ACTION_SEQUENCES[actionSeq]) {
        const isSkill = DataManager.isSkill(this._action);
        throw new Error(`could not find action sequence key '${actionSeq}' for ${isSkill ? 'skill' : 'item'} ID ${this._action.id}`);
    }
    return null;
};

Game_ActionABS.prototype.actionSequenceLength = function() {
    if (!this.actionSequence()) return 0;
    return Object.keys(this.actionSequence()).reduce((len, key) => {
        if (parseInt(key) > len) return parseInt(key);
        return len;
    }, 0);
};

export default Game_ActionABS;