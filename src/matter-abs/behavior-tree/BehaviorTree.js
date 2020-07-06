import { Selector } from "./types";
import { Act } from "./Act";
import { Idle } from "./Idle";

class Root extends Selector {
    constructor(behaviorTree) {
        super(behaviorTree, [ 
            Act, 
            Idle,
        ]);
    }
}

export default class BehaviorTree {
    constructor(battler) {
        this.battler = battler;
        this.root = new Root(this);
    }

    tick() {
        this.root.tick();
    }
}