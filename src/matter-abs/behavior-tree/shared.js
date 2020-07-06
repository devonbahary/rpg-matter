import { Leaf } from "./types";
import STATUSES from "./statuses";

export class HasAction extends Leaf {
    tick() {
        if (this.battler.hasAction()) return STATUSES.SUCCESS;
        return STATUSES.FAILURE;
    }
}

export class TurnTowardTarget extends Leaf {
    tick() {
        if (this.target) {
            if (this.target !== this.battler) this.battler.turnTowardTarget(this.target);
            else if (this.battler.topAggroBattler()) this.battler.turnTowardTarget(this.battler.topAggroBattler());
            return STATUSES.SUCCESS;
        }
        return STATUSES.FAILURE;
    }
}
