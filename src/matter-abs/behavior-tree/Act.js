import { Selector, Sequence, Leaf, STATUSES } from "./types";

export class Act extends Sequence {
    constructor(behaviorTree) {
        super(behaviorTree, [
            NotAlreadyHasAction,
            DetermineAction,
            PursueAction,
        ]);
    }
}

class NotAlreadyHasAction extends Leaf {
    tick() {
        if (this.battler.hasAction()) return STATUSES.FAILURE;
        return STATUSES.SUCCESS;
    }
}

class DetermineAction extends Leaf {
    constructor(behaviorTree) {
        super(behaviorTree);
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
    constructor(behaviorTree) {
        super(behaviorTree, [
            HasAppropriateTargetForAction,
            TurnTowardTarget,
            ShouldExecuteAction,
            MoveInRangeForAction,
            ExecuteAction,
        ]);
    }
}

class HasAppropriateTargetForAction extends Leaf {
    tick() {
        return this.target ? STATUSES.SUCCESS : STATUSES.FAILURE;
    }
}

class TurnTowardTarget extends Leaf {
    tick() {
        if (this.target) {
            this.battler.turnTowardTarget(this.target);
            return STATUSES.SUCCESS;
        }
        return STATUSES.FAILURE;
    }
}

class MoveInRangeForAction extends Selector {
    constructor(behaviorTree) {
        super(behaviorTree, [
            IsTargetInRange,
            MoveTowardsTarget,
            PathfindToTarget,
            ConfusedState,
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
        if (this.battler.overlapsWith(this.target)) return STATUSES.FAILURE;

        if (!this.battler.hasLineOfSightTo(this.target)) return STATUSES.FAILURE;

        if (this.battler.isPathfinding()) this.battler.character.clearPathfinding();

        this.battler.moveTowardTarget(this.target);

        return STATUSES.RUNNING;
    }
}

class PathfindToTarget extends Leaf {
    tick() {
        if (this.battler.distanceFrom(this.target) <= 0) return STATUSES.FAILURE;

        if (!this.battler.isPathfinding()) this.battler.pathfindToTarget(this.target);

        return STATUSES.RUNNING;
    }
}

class ShouldExecuteAction extends Leaf {
    tick() {
        // only 1 enemy should attack a single battler at any one time
        if ($gameMap.blackboard.isBattlerBeingAttacked(this.target)) return STATUSES.FAILURE;
        return STATUSES.SUCCESS;
    }
}

class ExecuteAction extends Sequence {
    constructor(behaviorTree) {
        super(behaviorTree, [
            IsTargetInRange,
            PerformAction,
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

        $gameMap.blackboard.setAttackingBattler(this.battler, this.target);

        return STATUSES.RUNNING;
    }
}

class ConfusedState extends Leaf {
    constructor(behaviorTree) {
        super(behaviorTree);
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