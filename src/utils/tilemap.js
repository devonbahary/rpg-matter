const TILE_BORDER_THICKNESS = 0.01; // the smaller, the more realistic but more prone to collision error

const getTilemapProperty2DArray = gameMap => {
  const tilemapProperty2DArray = {};

  for (let y = 0; y < gameMap.height(); y++) {
    tilemapProperty2DArray[y] = {};

    // record passability in each direction for this tile
    for (let x = 0; x <= gameMap.width(); x++) {
      const tile = {
        2: gameMap.isValid(x, y + 1) && gameMap.isPassable(x, y, 2),
        4: gameMap.isValid(x - 1, y) && gameMap.isPassable(x, y, 4),
        6: gameMap.isValid(x + 1, y) && gameMap.isPassable(x, y, 6),
        8: gameMap.isValid(x, y - 1) && gameMap.isPassable(x, y, 8)
      };
      tilemapProperty2DArray[y][x] = tile;
    }

  }

  return tilemapProperty2DArray;
};

// get tilemap collision objects from tiles that are wholly impassable
const getTileCollisionObjects = (collisionTiles2DArray, gameMap) => {
  const tilemapCollisonObjects = [];
  
  for (let y = 0; y < gameMap.height(); y++) {
    for (let x = 0; x < gameMap.width(); x++) {
      if (!collisionTiles2DArray[y][x]) continue;

      const potentialObject = {
        x1: x,
        x2: null,
        y1: y,
        y2: null
      };

      spanObject:
        for (let spanY = y; spanY < gameMap.height(); spanY++) {
          // span right 
          for (let spanX = x; spanX <= gameMap.width(); spanX++) {
            if (potentialObject.x2 && spanX > potentialObject.x2) break spanObject;
            if (!gameMap.isValid(spanX, spanY) || !collisionTiles2DArray[spanY][spanX]) {
              if (!potentialObject.x2) potentialObject.x2 = spanX;
              if (potentialObject.x2 === spanX) potentialObject.y2 = spanY + 1;
              if (spanX < potentialObject.x2) break spanObject;
              break;
            } 
          }
        }
      
      let coveredNewGround = false;
      checkForNewGround:
        for (let spanY = potentialObject.y1; spanY < potentialObject.y2; spanY++) {
          for (let spanX = potentialObject.x1; spanX < potentialObject.x2; spanX++) {
            if (collisionTiles2DArray[spanY][spanX] === 1) coveredNewGround = true;
            collisionTiles2DArray[spanY][spanX] = 2;
          }
        }
      
      if (coveredNewGround) tilemapCollisonObjects.push(potentialObject);
    }
  }

  return tilemapCollisonObjects;
};

// trim tilemap collision objects such that none overlap (this way, an entity only has to calculate
// collision with one tilemap collision object in any given tile)
const getTrimmedTileCollisionObjects = collisionObjects => collisionObjects.reduce((acc, objectA) => {
  let overlapX1, overlapX2;
  for (let spanX = objectA.x1; spanX < objectA.x2; spanX++) {
    let entireColumnOverlapped = true;
    
    for (let spanY = objectA.y1; spanY < objectA.y2; spanY++) {
      const isAnotherCollisionObjectSpanningThisColumn = collisionObjects.some(objectB => 
        objectA !== objectB && 
        spanX >= objectB.x1 && 
        spanX < objectB.x2 && 
        spanY >= objectB.y1 && 
        spanY < objectB.y2
      );

      if (!isAnotherCollisionObjectSpanningThisColumn) {
        entireColumnOverlapped = false;
        break;  
      } 
    }

    if (entireColumnOverlapped && !overlapX1) {
      overlapX1 = spanX;
      overlapX2 = spanX + 1;
    } else if (entireColumnOverlapped && overlapX2) {
      overlapX2++;
    } else if (!entireColumnOverlapped && overlapX1 && overlapX1 === objectA.x1) {
      objectA.x1 = overlapX2;
      break;
    }
    
    if (overlapX2 === objectA.x2) {
      objectA.x2 = overlapX1;
      break;
    }
  }

  return [ ...acc, objectA ];
}, []);

// get tile border collision objects (one-way impassability)
const getTileBorderCollisionObjects = (tilemapProperty2DArray, gameMap) => {
  const tileBorderCollisionObjects = [];
  for (let y = 0; y < gameMap.height(); y++) {
    for (let x = 0; x < gameMap.width(); x++) {
      const tileProperties = tilemapProperty2DArray[y][x];

      // is not a tile border collision object if no border is passable (already covered by 
      // regular tilemap collision objects)
      if (Object.values(tileProperties).every(isPassable => !isPassable)) continue;

      Object.entries(tileProperties).forEach(([ dir, isPassable ]) => {
        if (isPassable) return;

        switch(Number(dir)) {
          case 2:
            return tileBorderCollisionObjects.push({ 
              x1: x, 
              x2: x + 1, 
              y1: y + 1, 
              y2: y + 1 + TILE_BORDER_THICKNESS
            });
          case 4:
            return tileBorderCollisionObjects.push({ 
              x1: x, 
              x2: x + TILE_BORDER_THICKNESS, 
              y1: y, 
              y2: y + 1 
            });
          case 6:
            return tileBorderCollisionObjects.push({ 
              x1: x + 1, 
              x2: x + 1 + TILE_BORDER_THICKNESS, 
              y1: y, 
              y2: y + 1 
            });
          case 8:
            return tileBorderCollisionObjects.push({ 
              x1: x, 
              x2: x + 1, 
              y1: y, 
              y2: y + TILE_BORDER_THICKNESS
            });
        }
      });
    }
  }
  return tileBorderCollisionObjects;
};

const getTrimmedTileBorderCollisionObjects = (tileBorderCollisionObjects, gameMap) => {
  const trimmedTileBorderCollisionObjects = [];

  for (let x = 0; x <= gameMap.width(); x++) {
    const tileBorderObjectsInX = tileBorderCollisionObjects.filter(tileBorder => tileBorder.x1 === x);
    let spanY = 0, spanningTileBorderObject = null;
    while (spanY <= gameMap.height()) {
      const tileBorderObjectAtY = tileBorderObjectsInX.find(tileBorder => tileBorder.y1 === spanY && tileBorder.y2 - tileBorder.y1 === 1);
      if (tileBorderObjectAtY) {
        if (spanningTileBorderObject) {
          spanningTileBorderObject.y2 = tileBorderObjectAtY.y2; // extend spanningTileBorderObject's height to span the next tile border
        } else {
          spanningTileBorderObject = Object.assign({}, tileBorderObjectAtY);
        }
      } else if (spanningTileBorderObject) {
        trimmedTileBorderCollisionObjects.push(spanningTileBorderObject);
        spanningTileBorderObject = null;
      }
      spanY++;
    }
  }

  for (let y = 0; y <= gameMap.height(); y++) {
    const tileBorderObjectsInY = tileBorderCollisionObjects.filter(tileBorder => tileBorder.y1 === y);
    let spanX = 0, spanningTileBorderObject = null;
    while (spanX <= gameMap.width()) {
      const tileBorderObjectAtX = tileBorderObjectsInY.find(tileBorder => tileBorder.x1 === spanX && tileBorder.x2 - tileBorder.x1 === 1);
      if (tileBorderObjectAtX) {
        if (spanningTileBorderObject) {
          spanningTileBorderObject.x2 = tileBorderObjectAtX.x2; // extend spanningTileBorderObject's width to span the next tile border
        } else {
          spanningTileBorderObject = Object.assign({}, tileBorderObjectAtX);
        }
      } else if (spanningTileBorderObject) {
        trimmedTileBorderCollisionObjects.push(spanningTileBorderObject);
        spanningTileBorderObject = null;
      }
      spanX++;
    }
  }

  return trimmedTileBorderCollisionObjects;
};

export const getTilemapCollisionObjects = gameMap => {
  const tilemapProperty2DArray = getTilemapProperty2DArray(gameMap);

  // find entirely impassable tiles
  const collisionTiles2DArray = [];
  for (let y = 0; y < gameMap.height(); y++) {
    collisionTiles2DArray.push([]);
    for (let x = 0; x <= gameMap.width(); x++) {
      const tileProperties = tilemapProperty2DArray[y][x]
      const hasPassabilityInSomeDirection = Object.values(tileProperties).some(isPassable => isPassable);
      // 1 is a collision tile, 0 is a passable tile
      collisionTiles2DArray[y].push(hasPassabilityInSomeDirection ? 0 : 1);
    }
  }

  const tileCollisionObjects = getTileCollisionObjects(collisionTiles2DArray, gameMap);
  const trimmedTileCollisionObjects = getTrimmedTileCollisionObjects(tileCollisionObjects);
  const tileBorderCollisionObjects = getTileBorderCollisionObjects(tilemapProperty2DArray, gameMap);
  const trimmedTileBorderCollisionObjects = getTrimmedTileBorderCollisionObjects(tileBorderCollisionObjects, gameMap);
  
  return [ 
    ...trimmedTileCollisionObjects, 
    ...trimmedTileBorderCollisionObjects 
  ];
};
