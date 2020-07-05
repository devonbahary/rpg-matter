const STATUSES = {
    SUCCESS: 0,
    FAILURE: 1,
    RUNNING: 2,
};

class Selector {
    constructor(children) {
        this.children = children;
    }

    tick() {
        let activeChildIndex = 0;
        while (activeChildIndex < this.children.length) {
            const activeChild = this.children[activeChildIndex];
            const childStatus = activeChild.tick();
            
            switch (childStatus) {
                case STATUSES.SUCCESS:
                    return STATUSES.SUCCESS; // exit as soon as a child succeeds
                case STATUSES.FAILURE:
                    activeChildIndex++;
                    break;
                case STATUSES.RUNNING:
                    return STATUSES.RUNNING;
                default:
                    throw new Error(`selector can't process child status ${childStatus}`);
            }
        }
    }
}

class Sequence {
    constructor(children) {
        this.activeChildIndex = 0;;
        this.children = children;
    }

    reset() {
        if (this.children[this.activeChildIndex]) this.children[this.activeChildIndex].reset();
    }

    tick() {        
        let activeChildIndex = 0;
        while (activeChildIndex < this.children.length) {
            const activeChild = this.children[activeChildIndex];
            const childStatus = activeChild.tick();

            switch (childStatus) {
                case STATUSES.SUCCESS:
                    activeChildIndex++;
                    break;
                case STATUSES.FAILURE:
                    return STATUSES.FAILURE; // all children must succeed for a Sequence to succeed
                case STATUSES.RUNNING:
                    return STATUSES.RUNNING;
                default:
                    throw new Error(`sequence can't process child status ${childStatus}`);
            }   
        }
    }
}

class Leaf {
    constructor(battler, action) {
        this.battler = battler;
        this.action = action;
    }

    get target() {
        if (this.action.isForOpponent()) return this.battler.topAggroBattler();
        return null;
    }
}

export class Root extends Selector {
    constructor(battler, action) {
        super([
            new PursueAction(battler, action),
            new ConfusedState(battler),
        ]);
    }
}

class PursueAction extends Sequence {
    constructor(battler, action) {
        super([
            new HasAppropriateTargetForAction(battler, action),
            new MoveInRangeForAction(battler, action),
            new ExecuteAction(battler, action),
        ]);
    }
}

class HasAppropriateTargetForAction extends Leaf {
    tick() {
        return this.target ? STATUSES.SUCCESS : STATUSES.FAILURE;
    }
}

class MoveInRangeForAction extends Selector {
    constructor(battler, action) {
        super([
            new IsTargetInRange(battler, action),
            new MoveTowardsTarget(battler, action),
            new PathfindToTarget(battler, action),
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
    constructor(battler, action) {
        super([
            new IsTargetInRange(battler, action),
            new PerformAction(battler, action),
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
    constructor(battler, action) {
        super(battler, action);
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