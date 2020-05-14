import { Pair } from "matter-js";

const _Pair_update = Pair.update;
Pair.update = (pair, collision, timestamp) => {
    _Pair_update(pair, collision, timestamp);
    const { parentA, parentB } = collision;
    if (parentA.isTurning || parentB.isTurning) Pair.setActive(pair, false, timestamp);
};

const _Game_CharacterBase_setDirection = Game_CharacterBase.prototype.setDirection;
Game_CharacterBase.prototype.setDirection = function(d) {
    _Game_CharacterBase_setDirection.call(this, d);
    this.body.isTurning = true;
};

const _Game_CharacterBase_update = Game_CharacterBase.prototype.update;
Game_CharacterBase.prototype.update = function() {
    if (this.body.isTurning) this.body.isTurning = false;
    _Game_CharacterBase_update.call(this);
};