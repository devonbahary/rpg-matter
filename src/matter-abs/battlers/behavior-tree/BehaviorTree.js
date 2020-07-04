// Game_Battler.prototype.updateEligibleActions = function() {
//     const eligibleActions = this.getEligibleActions();
//     const serializedEligibleActions = JSON.stringify(eligibleActions);

//     if (serializedEligibleActions !== this._eligibleActionsMem) {
//         this._eligibleActionsMem = serializedEligibleActions;

//         const ratingZero = this.getRatingZeroForActions(eligibleActions);
//         const action = this.selectAction(eligibleActions, ratingZero);

//         this._pursuedAction = action ? $dataSkills[action.skillId] : null;
//     }
// };

class Node {
    constructor({ battler, behaviorTree, parent, returnCondition }) {
        this.behaviorTree = behaviorTree;
        this.battler = battler;
        this.parent = parent;
        this.returnCondition = returnCondition;
    }

    reset() {
        this.behaviorTree.reset();
    }

    tick() {
        if (this.returnCondition && this.returnCondition()) this.behaviorTree.setActiveNode(this.parent); 
    }
}

class ActionNode extends Node {
    constructor(behaviorTree, battler, dataSkill) {
        super({ battler, behaviorTree });
        this.dataSkill = dataSkill;
        this.action = new Game_ActionABS(battler, dataSkill);
    }

    triggerPathfinding(target) {
        const pathfindingNode = new PathfindingNode({
            battler: this.battler, 
            behaviorTree: this.behaviorTree, 
            target,
            parent: this,
            returnCondition: () => this.battler.hasLineOfSightTo(target),
        });
        this.behaviorTree.setActiveNode(pathfindingNode);
    }

    setPursuedAction() {
        this.battler.setAction(this.dataSkill);
        if (this.battler.currentAction().needsSelection()) this.battler.currentAction().setTarget(target);
        this.behaviorTree.setActiveNode(new CurrentActionNode(this.battler));
    }

    tick() {
        Node.prototype.tick.call(this);
        if (this.action.isForOpponent()) {
            const target = this.battler.topAggroBattler();

            if (!target) return this.reset();

            if (!this.battler.hasLineOfSightTo(target)) return this.triggerPathfinding(target);

            if (this.battler.distanceBetween(target) <= this.action.range()) {
                const battlers = this.action.determineTargets();
                if (battlers.includes(target) || this.battler.isBlinded()) {
                    return this.setPursuedAction();
                }
            }
            
            if (this.battler.hasLineOfSightTo(target)) this.battler.moveTowardTarget(target);
        }
    }
}

class CurrentActionNode {
    constructor(battler) {
        this.battler = battler;
    }

    tick() {
        const target = this.battler.topAggroBattler();
        if (target) this.battler.turnTowardTarget(target);
    }
}

class PathfindingNode extends Node {
    constructor({ battler, behaviorTree, parent, returnCondition, target }) {
        super({ behaviorTree, battler, parent, returnCondition });
        this.target = target;
        this.pathfindingCount = 0;
        this.idleAtDestinationCount = 0;
        this.updateDestination();
    }

    updateDestination() {
        const targetPosition = this.battler.getPerceivedBattlerCharacter(this.target).mapPos;
        if (targetPosition !== this.lastKnownTargetPosition) {
            this.lastKnownTargetPosition = targetPosition;
            this.pathfind();
        }
    }

    shouldReassess() {
        return this.pathfindingCount % 60 === 0; // every second
    }

    tick() {
        Node.prototype.tick.call(this);

        if (!this.battler.isPathfinding()) {
            this.battler.turnTowardTarget(this.target);
            this.idleAtDestinationCount++;
        } else {
            this.idleAtDestinationCount = 0;
        }

        if (this.battler.hasLineOfSightTo(this.target)) return this.reset();

        if (this.idleAtDestinationCount > 60) {
            const confusedNode = new ConfusedNode({
                battler: this.battler,
                behaviorTree: this.behaviorTree,
                parent: this,
                returnCondition: this.returnCondition,
            });
            return this.behaviorTree.setActiveNode(confusedNode);
        }


        if (this.shouldReassess()) {
            this.updateDestination();
        } 

        this.pathfindingCount++;
    }

    pathfind() {
        this.battler.pathfindToTarget(this.target);
        this.pathfindingCount++;
    }

    reset() {
        Node.prototype.reset.call(this);
        this.battler.character.clearPathfinding();
    }
}

class ConfusedNode extends Node {
    constructor({ battler, behaviorTree, parent, returnCondition }) {
        super({ battler, behaviorTree, parent, returnCondition });
        battler.character.requestBalloon(ConfusedNode.CONFUSED_BALLOON_ID);
        this.confusedCount = 0;
    }

    static get CONFUSED_BALLOON_ID() {
        return 2;
    }

    static get CONFUSED_CYCLES() {
        return 4;
    }

    tick() {
        Node.prototype.tick.call(this);
        this.confusedCount++;
        if (this.confusedCount > 240 * ConfusedNode.CONFUSED_CYCLES) return this.reset();
        if (this.confusedCount % 240 === 0) this.battler.character.moveRandom();
        else if (this.confusedCount % 60 === 0) this.battler.character.turnRight90();
    }
}

class ActionSelectorNode {
    constructor(behaviorTree, battler) {
        this.behaviorTree = behaviorTree;
        this.battler = battler;
    };

    selectAction() {
        const actions = this.battler.getEligibleActions();
        const ratingZero = this.battler.getRatingZeroForActions(actions);
        const action = this.battler.selectAction(actions, ratingZero);
        if (action) return $dataSkills[action.skillId];
        return null;
    }

    tick() {
        // assess actions
        const action = this.selectAction();
        if (action) {
            const actionNode = new ActionNode(this.behaviorTree, this.battler, action);
            this.behaviorTree.setActiveNode(actionNode);
        }
    }
}

export default class BehaviorTree { // a.k.a "root node"
    constructor(battler) {
        this.battler = battler;
        this.activeNode = null;
    }

    setActiveNode(node) {
        this.activeNode = node;
    }

    reset() {
        this.activeNode = null;
    }

    tick() {
        if (this.activeNode) return this.activeNode.tick();

        this.setActiveNode(new ActionSelectorNode(this, this.battler));
    }
};