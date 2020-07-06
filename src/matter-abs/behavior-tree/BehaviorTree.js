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
        this.lastAction = null;
        this.actionDuration = 0;
    }

    update() {
        this.timeSinceLastAction++;
        if (this.battler.currentAction() && this.lastAction === this.battler.currentAction()) {
            this.actionDuration++;
        } else {
            this.actionDuration = 0;
        }
        this.lastAction = this.battler.currentAction();
    }

    tick() {
        this.root.tick();
        this.update();
    }
}