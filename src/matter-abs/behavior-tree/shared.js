import { Leaf, STATUSES } from "./types";

export class HasAction extends Leaf {
    tick() {
        if (this.battler.hasAction()) return STATUSES.SUCCESS;
        return STATUSES.FAILURE;
    }
}