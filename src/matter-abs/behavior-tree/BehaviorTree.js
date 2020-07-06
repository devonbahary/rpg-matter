import { Selector } from "./types";
import { Act } from "./Act";
import { CurrentAction } from "./CurrentAction";
import { Idle } from "./Idle";

class Root extends Selector {
    constructor(behaviorTree) {
        super(behaviorTree, [ 
            Act,
            CurrentAction, 
            Idle,
        ]);
    }
}

export default class BehaviorTree {
    constructor(battler) {
        this.battler = battler;
        this.root = new Root(this);
        this.initMembers();
    }

    initMembers() {
        this.timeSinceLastAction = 0;
    }

    update() {
        this.timeSinceLastAction++;
    }

    tick() {
        this.root.tick();
        this.update();
    }
}