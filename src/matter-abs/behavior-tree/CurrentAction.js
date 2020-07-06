import { Sequence, Leaf, STATUSES } from "./types";

export class CurrentAction extends Sequence {
    constructor(behaviorTree) {
        super(behaviorTree, [
            HasAction,
            MaintainCurrentAction,
        ]);     
    }
}

class HasAction extends Leaf {
    tick() {
        if (this.battler.hasAction()) return STATUSES.SUCCESS;
        return STATUSES.SUCCESS;
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