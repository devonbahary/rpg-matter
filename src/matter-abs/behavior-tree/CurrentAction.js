import { Sequence, Leaf } from "./types";
import { HasAction, TurnTowardTarget } from "./shared";
import STATUSES from "./statuses";

export class CurrentAction extends Sequence {
    constructor(behaviorTree) {
        super(behaviorTree, [
            HasAction,
            TurnTowardTarget,
            MaintainAction,
        ]);     
    }
};

class MaintainAction extends Leaf {
    constructor(behaviorTree) {
        super(behaviorTree);
    }
    
    tick() {
        if (this.action.isGuard() && this.behaviorTree.actionDuration > 180) this.battler.clearAction();
        return STATUSES.RUNNING;
    }
}