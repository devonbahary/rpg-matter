import { Pair } from "matter-js";


const ignorePairIdsForOneFrame = {};

const _Pair_update = Pair.update;
Pair.update = (pair, collision, timestamp) => {
    // just because we wanted to set a pair as inactive in one frame doesn't mean we want it to be ignored henceforth
    if (ignorePairIdsForOneFrame[pair.id]) {
        delete ignorePairIdsForOneFrame[pair.id];
        Pair.setActive(pair, true, timestamp); // pair only ignored if active to begin with
    }

    _Pair_update(pair, collision, timestamp);

    const { bodyA, bodyB } = collision;
    const isTurning = bodyA.isTurning || bodyB.isTurning;
    
    const { character: characterA } = bodyA;
    const { character: characterB } = bodyB;

    const isSensor = (bodyA.isSensor || bodyB.isSensor); // update sensor throughout life cycle of Pair, don't just set on creation
    const isDifferentPriorityTypes = characterA && characterB && characterA._priorityType !== characterB._priorityType;

    if (isSensor || isDifferentPriorityTypes) {
        pair.isSensor = true;
    } else if (isTurning && pair.isActive) {
        // set inactive for one frame; this is to prevent unpredictable collision physics when a body turns while touching another
        Pair.setActive(pair, false, timestamp); 
        ignorePairIdsForOneFrame[pair.id] = true;
    }
};

const _Game_CharacterBase_setDirection = Game_CharacterBase.prototype.setDirection;
Game_CharacterBase.prototype.setDirection = function(d) {
    _Game_CharacterBase_setDirection.call(this, d);
    this._characterBody.isTurning = true;
};

const _Scene_Map_updateMain = Scene_Map.prototype.updateMain;
Scene_Map.prototype.updateMain = function() {
    if (this.isActive()) {
        $gameMap.characterBodies.forEach(characterBody => {
            characterBody.parts.forEach(p => { p.isTurning = false; });
        });
    }
    _Scene_Map_updateMain.call(this);
};