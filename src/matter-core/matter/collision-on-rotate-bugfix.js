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

const _Scene_Map_updateMain = Scene_Map.prototype.updateMain;
Scene_Map.prototype.updateMain = function() {
  [
    $gamePlayer.body,
    ...$gameMap.events().map(e => e.body),
    ...$gameMap.vehicles().map(v => v.body),
  ].forEach(b => { b.isTurning = false; });
  _Scene_Map_updateMain.call(this);
};