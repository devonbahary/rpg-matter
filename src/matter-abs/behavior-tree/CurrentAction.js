import { Sequence } from "./types";
import { HasAction, TurnTowardTarget } from "./shared";

export class CurrentAction extends Sequence {
    constructor(behaviorTree) {
        super(behaviorTree, [
            HasAction,
            TurnTowardTarget,
        ]);     
    }
};