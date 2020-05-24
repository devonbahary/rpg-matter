export const WEAPON_POSES = {
    IDLE: 'idle',
    EXTEND: 'extend',
};

export const getWeaponSpritePosition = (weaponPose, direction, pattern, iconIndex) => {
    const position = WEAPON_POSE_TO_POSITION[weaponPose][direction] || {};
    const anchor = ICON_INDEX_TO_ANCHOR[iconIndex] || {};

    const patternDx = pattern === 1 ? 0 : DIRECTION_PATTERN_ADJ[direction][pattern].x;
    const patternDy = pattern === 1 ? 0 : DIRECTION_PATTERN_ADJ[direction][pattern].y;
    
    return {
        anchorX: 0.5,
        anchorY: 1,
        ...anchor,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        ...position,
        x: position.x + patternDx,
        y: position.y + patternDy,
        z: position.z || 1,
    }
};

const DIRECTION_PATTERN_ADJ = {
    2: {
        0: {
            x: -2,
            y: -1,
        },
        2: {
            x: 3,
            y: 0,
        },
    },
    4: {
        0: {
            x: 3,
            y: -1,
        },
        2: {
            x: -7,
            y: -2,
        },
    },
    6: {
        0: {
            x: 5,
            y: -2,
        },
        2: {
            x: -3,
            y: -1,
        },
    },
    8: {
        0: {
            x: 1,
            y: 1,
        },
        2: {
            x: -3,
            y: -1,
        },
    },
};

const WEAPON_POSE_TO_POSITION = {
    [WEAPON_POSES.IDLE]: {
        2: {
            x: -25,
            y: -1,
        },
        4: {
            x: -12,
            y: -2,
            z: -1,
        }, 
        6: {
            x: 8,
            y: 0,
            scaleX: -1,
        },
        8: {
            x: 24,
            y: -1,
            z: -1,
            scaleX: -1,
        },
    },
    [WEAPON_POSES.EXTEND]: {
        2: {
            x: 0,
            y: -2,
            rotation: -(Math.PI / 4 + Math.PI / 2),
        },
        4: {
            x: -8,
            y: 4,
            z: -1,
            rotation: -Math.PI / 4,
        }, 
        6: {
            x: 1,
            y: 6,
            rotation: Math.PI / 4,
            scaleX: -1,
        },
        8: {
            x: 0,
            y: -14,
            z: -1,
            rotation: Math.PI / 4,
        },
    },
};

const ICON_INDEX_TO_ANCHOR = {
    96: {
        anchorX: 0.3,
        anchorY: 0.9,
    },
};