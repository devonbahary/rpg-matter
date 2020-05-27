//-----------------------------------------------------------------------------
// Game_Item
//
// The game object class for handling skills, items, weapons, and armor. It is
// required because save data should not include the database object itself.

import ACTION_SEQUENCES from "../action-sequences";

Game_Item.prototype.actionSequence = function() {
    const actionKey = this.object().meta.actionSeq;
    if (actionKey && ACTION_SEQUENCES[actionKey]) {
        return ACTION_SEQUENCES[actionKey];
    } else if (actionKey && !ACTION_SEQUENCES[actionKey]) {
        throw new Error(`could not find action sequence key '${actionKey}' for ${this.isSkill() ? 'skill' : 'item'} ID ${this._action.id}`);
    }
    return null;
};
