export const WEAPON_POSES = {
    IDLE: 'idle',
    DOWN_SWING: 'down-swing',
    MID_SWING: 'mid-swing',
    UP_SWING: 'up-swing',
    EXTEND: 'extend',
    RAISE: 'raise',
    GUARD: 'guard',
    HIP: 'SIDE',
    BEHIND: 'behind',
    DOWN_SWING_AXE: 'down-swing-axe',
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
        0: { x: -2, y: -1 },
        2: { x: 3, y: 0 },
    },
    4: {
        0: { x: 3, y: -1 },
        2: { x: -7, y: -2 },
    },
    6: {
        0: { x: 5, y: -2 },
        2: { x: -3, y: -1 },
    },
    8: {
        0: { x: 1, y: 1 },
        2: { x: -3, y: -1 },
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
    [WEAPON_POSES.DOWN_SWING]: {
        2: {
            x: -2,
            y: -16,
            rotation: Math.PI - Math.PI / 12,
        },
        4: {
            x: 0,
            y: 6,
            z: -1,
            rotation: -(Math.PI / 2 - Math.PI / 12),
        }, 
        6: {
            x: -6,
            y: 7,
            rotation: (Math.PI / 2 - Math.PI / 12),
            scaleX: -1,
        },
        8: {
            x: 0,
            y: -4,
            z: -1,
            rotation: -Math.PI / 12,
        },
    },
    [WEAPON_POSES.DOWN_SWING_AXE]: {
        2: {
            x: 3,
            y: -7,
            rotation: Math.PI + Math.PI / 12,
        },
        4: {
            x: -2,
            y: 6,
            z: -1,
            rotation: -(Math.PI / 2 - Math.PI / 6),
        }, 
        6: {
            x: 0,
            y: 10,
            rotation: (Math.PI / 2 - Math.PI / 6),
            scaleX: -1,
        },
        8: {
            x: 0,
            y: -4,
            z: -1,
            rotation: -Math.PI / 12,
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
    [WEAPON_POSES.RAISE]: {
        2: {
            x: -25,
            y: -9,
            rotation: Math.PI / 6,
        },
        4: {
            x: -12,
            y: -20,
            rotation: Math.PI / 2 - Math.PI / 12,
            z: -1,
        },
        6: {
            x: 4,
            y: -16,
            scaleX: -1,
            rotation: -(Math.PI / 2 - Math.PI / 12),
        },
        8: {
            x: 25,
            y: -9,
            rotation: -(Math.PI / 6),
            scaleX: -1,
            z: -1,
        },
    },
    [WEAPON_POSES.GUARD]: {
        2: {
            x: -5,
            y: 5,
            rotation: Math.PI / 4 - Math.PI / 16,
            scaleX: -1, 
        },
        4: {
            x: -6,
            y: 4,
            rotation: -Math.PI / 8,
            scaleX: 0.8,
            z: -1,
        },
        6: {
            x: 2,
            y: 4,
            rotation: Math.PI / 8,
            scaleX: -0.8,
        },
        8: {
            x: 4,
            y: 0,
            rotation: -Math.PI / 4 + Math.PI / 16,
            z: -1,
        },
    },
    [WEAPON_POSES.MID_SWING]: {
        2: {
            x: -4,
            y: 2,
            rotation: -Math.PI / 2 - Math.PI / 6,
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
    [WEAPON_POSES.UP_SWING]: {
        2: {
            x: -25,
            y: -4,
            rotation: Math.PI / 6 - Math.PI / 12,
        },
        4: {
            x: -12,
            y: -20,
            rotation: Math.PI / 2 - Math.PI / 6,
            z: -1,
        },
        6: {
            x: 8,
            y: -14,
            scaleX: -1,
            rotation: -(Math.PI / 2 - Math.PI / 6),
        },
        8: {
            x: 22,
            y: 1,
            rotation: -(Math.PI / 6 - Math.PI / 4),
            scaleX: -1,
            z: -1,
        },
    },
    [WEAPON_POSES.SIDE]: {
        2: {
            x: -17,
            y: 4,
            rotation: -Math.PI / 4,
        },
        4: {
            x: -12,
            y: -22,
            z: -1,
            rotation: Math.PI / 4,
        }, 
        6: {
            x: -16,
            y: 0,
            scaleX: -1,
            rotation: Math.PI / 4 + Math.PI / 2,
        },
        8: {
            x: 16,
            y: 4,
            z: -1,
            scaleX: -1,
            rotation: Math.PI / 4,
        },
    },
    [WEAPON_POSES.BEHIND]: {
        2: {
            x: -24,
            y: -10,
            rotation: Math.PI / 4,
            z: -1,
        },
        4: {
            x: 0,
            y: 4,
            z: -1,
            scaleX: -1,
            rotation: -Math.PI / 4 + Math.PI / 2,
        }, 
        6: {
            x: -8,
            y: 8,
            rotation: -Math.PI / 4,
        },
        8: {
            x: 24,
            y: -2,
            rotation: -(Math.PI / 4 + Math.PI / 2),
        },
    },
};

const ICON_INDEX_TO_ANCHOR = {
    416: { // DAGGER
        anchorX: 0.3,
        anchorY: 0.9,
    },
};