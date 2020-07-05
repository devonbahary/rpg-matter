import { Selector, Sequence, Leaf, STATUSES } from "./types";

export class Act extends Sequence {
    constructor(battler) {
        super([
            new DetermineAction(battler),
            new PursueActionOrConfused(battler),
        ]);
    }
}

class PursueActionOrConfused extends Selector {
    constructor(battler) {
        super([
            new PursueAction(battler),
            new ConfusedState(battler),
        ]);
    }
}

class DetermineAction extends Leaf {
    constructor(battler) {
        super(battler);
        this.serializedEligibleActions = null;
    }

    tick() {
        const eligibleActions = this.battler.getEligibleActions();
        const serializedEligibleActions = JSON.stringify(eligibleActions);

        if (serializedEligibleActions !== this.serializedEligibleActions || !this.battler.pursuedAction) {
            this.serializedEligibleActions = serializedEligibleActions;
            
            const ratingZero = this.battler.getRatingZeroForActions(eligibleActions);
            const action = this.battler.selectAction(eligibleActions, ratingZero);
            if (action) {
                this.battler.pursuedAction = new Game_ActionABS(this.battler, $dataSkills[action.skillId]);
            }
        }

        if (!this.battler.pursuedAction) return STATUSES.FAILURE;

        return STATUSES.SUCCESS;
    }
}

class PursueAction extends Sequence {
    constructor(battler) {
        super([
            new HasAppropriateTargetForAction(battler),
            new MoveInRangeForAction(battler),
            new ExecuteAction(battler),
        ]);
    }
}

class HasAppropriateTargetForAction extends Leaf {
    tick() {
        return this.target ? STATUSES.SUCCESS : STATUSES.FAILURE;
    }
}

class MoveInRangeForAction extends Selector {
    constructor(battler) {
        super([
            new IsTargetInRange(battler),
            new MoveTowardsTarget(battler),
            new PathfindToTarget(battler),
        ]);
    }
}

class IsTargetInRange extends Leaf {
    tick() {
        if (this.battler.distanceBetween(this.target) <= this.action.range()) {
            const battlers = this.action.determineTargets();
            if (battlers.includes(this.target) || this.battler.isBlinded()) {
                return STATUSES.SUCCESS;
            }
        }
        return STATUSES.FAILURE;
    }
}

class MoveTowardsTarget extends Leaf {
    tick() {
        if (this.battler.character.overlapsWith(this.battler.getPerceivedBattlerCharacter(this.target))) return STATUSES.SUCCESS;

        if (!this.battler.hasLineOfSightTo(this.target)) return STATUSES.FAILURE;

        if (this.battler.isPathfinding()) this.battler.character.clearPathfinding();

        this.battler.moveTowardTarget(this.target);

        return STATUSES.RUNNING;
    }
}

class PathfindToTarget extends Leaf {
    tick() {
       if (!this.battler.isPathfinding()) this.battler.pathfindToTarget(this.target);

       return STATUSES.RUNNING;
    }
}

class ExecuteAction extends Sequence {
    constructor(battler) {
        super([
            new IsTargetInRange(battler),
            new PerformAction(battler),
        ]);
    }
}

class PerformAction extends Leaf {
    tick() {
        if (this.battler.hasAction()) return STATUSES.RUNNING;

        if (this.battler.isPathfinding()) this.battler.character.clearPathfinding();

        this.battler.turnTowardTarget(this.target);
        this.battler.setAction(this.action.item());
        if (this.battler.currentAction().needsSelection()) {
            this.battler.currentAction().setTarget(target);
        }

        return STATUSES.RUNNING;
    }
}

class ConfusedState extends Leaf {
    constructor(battler) {
        super(battler);
        this.confusedCount = 0;
    }

    tick() {
        if ((Date.now() - this.lastConfused) / 60 > 30) this.confusedCount = 0; // reset if revisiting

        if (this.confusedCount <= 120 && this.confusedCount % 30 === 0) this.battler.character.turnRandom();
        else if (this.confusedCount === 180) this.battler.character.requestBalloon(2);
        else if (this.confusedCount % 120 === 0) this.battler.character.turnRandom();

        this.lastConfused = Date.now();
        this.confusedCount++;

        return STATUSES.RUNNING;
    }
}