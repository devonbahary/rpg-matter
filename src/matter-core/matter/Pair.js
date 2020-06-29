import { Pair } from "matter-js";

const _Pair_update = Pair.update;
Pair.update = (pair, collision, timestamp) => {
    _Pair_update(pair, collision, timestamp);

    const { bodyA, bodyB } = collision;
    
    const { character: characterA } = bodyA;
    const { character: characterB } = bodyB;

    const isSensor = (bodyA.isSensor || bodyB.isSensor); // update sensor throughout life cycle of Pair, don't just set on creation
    const isDifferentPriorityTypes = characterA && characterB && !characterA.canCollideWith(characterB);

    if (isSensor || isDifferentPriorityTypes) pair.isSensor = true;
};
