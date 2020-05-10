// A* pathfinding


/*
    TODO:
        - introduce higher cost to tiles occupied by characters
*/

import { get8DirFromXyPairs } from "./direction";

class Node {
    constructor({ x, y }, parent = null) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.g = 0;
        this.h = 0;
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

function canMoveToAndFromXyPairs([ x1, y1 ], [ x2, y2 ], dir) {
    const reverseDir = 10 - dir;
    return this.tilemapPropertyMatrix[y1][x1][dir] && this.tilemapPropertyMatrix[y2][x2][reverseDir];
};

function canMoveToNode(currentNode, adjacentNode) {
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

        if (!canMoveToAndFromXyPairs.call(this, startPair, pivotA, get8DirFromXyPairs(startPair, pivotA))) return false;
        if (!canMoveToAndFromXyPairs.call(this, pivotA, endPair, get8DirFromXyPairs(pivotA, endPair))) return false;

        if (!canMoveToAndFromXyPairs.call(this, startPair, pivotB, get8DirFromXyPairs(startPair, pivotB))) return false;
        if (!canMoveToAndFromXyPairs.call(this, pivotB, endPair, get8DirFromXyPairs(pivotB, endPair))) return false;
        
        return true;
    } else {
        return canMoveToAndFromXyPairs.call(this, startPair, endPair, get8DirFromXyPairs(startPair, endPair));
    }
};

const getPathfindingDistance = (node1, node2) => {
    const dx = Math.abs(node1.x - node2.x);
    const dy = Math.abs(node1.y - node2.y);

    const diagonalCost = Math.min(dx, dy) * 14; // √2 * 10 (~Pythagorean)
    const straightCost = (Math.max(dx, dy) - Math.min(dx, dy)) * 10; // 10

    return diagonalCost + straightCost;
};

export function getPathTo(startPos, endPos) {
    let openList = [];
    const closedList = [];

    const startNode = new Node(startPos);
    const endNode = new Node(endPos);

    openList.push(startNode);

    let endNodeWithPath;
    while (openList.length) {
        // find node with lowest F cost
        const currentNode = openList.reduce((acc, node) => {
            if (!acc) return acc;
            if (node.f < acc.f) return node;
            return acc;
        });

        // remove current from open
        openList = openList.filter(node => node.id !== currentNode.id);
        // add current to closed
        closedList.push(currentNode);

        // goal condition
        if (currentNode.id === endNode.id) {
            endNodeWithPath = currentNode;
            break;
        };

        // for each adjacent node of current
        const adjacentNodes = getAdjacentNodes(currentNode);
        for (const adjacentNode of adjacentNodes) {
            // skip adjacent node if inaccessible or in closed
            if (closedList.some(node => node.id === adjacentNode.id) || !canMoveToNode.call(this, currentNode, adjacentNode)) {
                continue;
            }
            
            // if adjacent node is not in open or path to adjacent node is shorter than existing
            const g = currentNode.g + getPathfindingDistance(currentNode, adjacentNode);
            const existingNodeAtPositionInOpenList = openList.find(node => node.id === adjacentNode.id);
            if (!existingNodeAtPositionInOpenList) {
                adjacentNode.g = g;
                adjacentNode.h = getPathfindingDistance(adjacentNode, endNode);
                openList.push(adjacentNode);
            } else if (existingNodeAtPositionInOpenList.g > g) {
                existingNodeAtPositionInOpenList.g = g;
                existingNodeAtPositionInOpenList.parent = currentNode;
            }
        }
    };

    if (endNodeWithPath) {
        let path = [ endNodeWithPath ];
        let head = endNodeWithPath;
        while (head.parent) {
            path.push(head.parent);
            head = head.parent;
        }

        return path.reverse();
    }

    return [];
};