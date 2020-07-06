import { Sequence, Leaf, STATUSES } from "./types";
import { HasAction } from "./shared";

export class CurrentAction extends Sequence {
    constructor(behaviorTree) {
        super(behaviorTree, [
            HasAction,
            MaintainCurrentAction,
        ]);     
    }
}

class MaintainCurrentAction extends Leaf {
    tick() {
        if (!this.target) return STATUSES.RUNNING;
        if (this.target !== this.battler) this.battler.turnTowardTarget(this.target);
        else if (this.battler.topAggroBattler()) this.battler.turnTowardTarget(this.battler.topAggroBattler());
        return STATUSES.RUNNING;
    }
}