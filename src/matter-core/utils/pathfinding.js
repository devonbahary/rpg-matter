// A* pathfinding


/*
    TODO:
        - introduce higher cost to tiles occupied by characters
*/

import { get8DirFromXyPairs } from "./direction";
import { createBounds } from "./bounds";

class Node {
    constructor({ x, y }, parent = null) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.g = 0; // movement cost from start
        this.h = 0; // estimated movement cost to end
        this.parent = parent;
    };

    get id() { // nodes with the same XY coordinate have the same identifier
        return `${this.x}-${this.y}`;
    }

    get f() { // total cost
        return this.g + this.h;
    };
};

const getAdjacentNodes = currentNode => {
    const nodes = [];
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const x = currentNode.x + dx;
            const y = currentNode.y + dy;
            nodes.push(new Node({ x, y }, currentNode));
        }
    }
    return nodes;
};

function canMoveToAndFromXyPairs([ x1, y1 ], [ x2, y2 ], dir, forCharacter) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2) + 1;
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2) + 1;
    const bounds = createBounds(minX, maxX, minY, maxY);

    const otherCharsInBoundingBox = this.characterBodiesInBoundingBox(bounds).filter(characterBody => (
        characterBody.character !== forCharacter && forCharacter.canCollideWith(characterBody.character)
    ));
    if (otherCharsInBoundingBox.length) return false;

    const reverseDir = 10 - dir;
    return this.tilemapPropertyMatrix[y1][x1][dir] && this.tilemapPropertyMatrix[y2][x2][reverseDir];
};

function canMoveToNode(currentNode, adjacentNode, forCharacter) {
    const x1 = currentNode.x;
    const y1 = currentNode.y;
    const x2 = adjacentNode.x;
    const y2 = adjacentNode.y;

    const startPair = [ x1, y1 ];
    const endPair = [ x2, y2 ];

    if (x1 !== x2 && y1 !== y2) {
        // a tile is diagonally accessible if both 4-dir routes to that tile are accessible
        const pivotA = [ x1, y2 ];
        const pivotB = [ x2, y1 ];

        if (!canMoveToAndFromXyPairs.call(this, startPair, pivotA, get8DirFromXyPairs(startPair, pivotA), forCharacter)) return false;
        if (!canMoveToAndFromXyPairs.call(this, pivotA, endPair, get8DirFromXyPairs(pivotA, endPair), forCharacter)) return false;

        if (!canMoveToAndFromXyPairs.call(this, startPair, pivotB, get8DirFromXyPairs(startPair, pivotB), forCharacter)) return false;
        if (!canMoveToAndFromXyPairs.call(this, pivotB, endPair, get8DirFromXyPairs(pivotB, endPair), forCharacter)) return false;
        
        return true;
    } else {
        return canMoveToAndFromXyPairs.call(this, startPair, endPair, get8DirFromXyPairs(startPair, endPair), forCharacter);
    }
};

const getPathfindingDistance = (node1, node2) => {
    const dx = Math.abs(node1.x - node2.x);
    const dy = Math.abs(node1.y - node2.y);

    const diagonalCost = Math.min(dx, dy) * 14; // √2 * 10 (~Pythagorean)
    const straightCost = (Math.max(dx, dy) - Math.min(dx, dy)) * 10; // 10

    return diagonalCost + straightCost;
};

export function getPathTo(startPos, endPos, forCharacter, limit = null) {
    let openList = [];
    const closedList = [];

    const startNode = new Node(startPos);
    const endNode = new Node(endPos);
    
    startNode.h = getPathfindingDistance(startNode, endNode);

    openList.push(startNode);

    let closestNodeEncountered = startNode;
    while (openList.length) {
        // find node with lowest F cost
        const currentNode = openList.reduce((acc, node) => {
            if (!acc) return acc;
            if (node.f < acc.f) return node;
            return acc;
        });
        
        if (limit && currentNode.g > limit * 10) break;

        // remove current from open
        openList = openList.filter(node => node.id !== currentNode.id);
        // add current to closed
        closedList.push(currentNode);

        // goal condition
        if (currentNode.id === endNode.id) {
            closestNodeEncountered = currentNode;
            break;
        };

        // for each adjacent node of current
        const adjacentNodes = getAdjacentNodes(currentNode);
        for (const adjacentNode of adjacentNodes) {
            // skip adjacent node if inaccessible or in closed
            if (closedList.some(node => node.id === adjacentNode.id) || !canMoveToNode.call(this, currentNode, adjacentNode, forCharacter)) {
                continue;
            }
            
            // if adjacent node is not in open or path to adjacent node is shorter than existing
            const g = currentNode.g + getPathfindingDistance(currentNode, adjacentNode);
            const existingNodeAtPositionInOpenList = openList.find(node => node.id === adjacentNode.id);
            if (!existingNodeAtPositionInOpenList) {
                adjacentNode.g = g;
                adjacentNode.h = getPathfindingDistance(adjacentNode, endNode);
                
                if (closestNodeEncountered.h > adjacentNode.h) closestNodeEncountered = adjacentNode;
                
                openList.push(adjacentNode);
            } else if (existingNodeAtPositionInOpenList.g > g) {
                existingNodeAtPositionInOpenList.g = g;
                existingNodeAtPositionInOpenList.parent = currentNode;
            }
        }
    };

    if (closestNodeEncountered) {
        // construct path working backwards
        let path = [ closestNodeEncountered ];
        let head = closestNodeEncountered;
        while (head.parent) {
            path.push(head.parent);
            head = head.parent;
        }

        path = path.reverse();

        // remove first step to closest tile if doing so would be backtracking
        if (path.length >= 2) {
            const firstStep = path[0];
            const secondStep = path[1];

            const xRangeMin = Math.min(firstStep.x, secondStep.x);
            const xRangeMax = Math.max(firstStep.x, secondStep.x) + 1;
            const yRangeMin = Math.min(firstStep.y, secondStep.y);
            const yRangeMax = Math.max(firstStep.y, secondStep.y) + 1;
            
            const isCharInBetweenFirstAndSecondStep = (
                forCharacter.x.isInRange(xRangeMin, xRangeMax) ||
                forCharacter.y.isInRange(yRangeMin, yRangeMax)
            );

            if (isCharInBetweenFirstAndSecondStep) {
                path.shift();
            }
        }

        return path;
    }

    return [];
};