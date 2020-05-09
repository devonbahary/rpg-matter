/*
    7   8   9                   3π/2
    4       6               π       0
    1   2   3                   π/2
*/

export const isUp = dir => [ 7, 8, 9 ].includes(dir);
export const isRight = dir => [ 3, 6, 9 ].includes(dir);
export const isDown = dir => [ 1, 2, 3].includes(dir);
export const isLeft = dir => [ 1, 4, 7].includes(dir);

const DIR_8_TO_ANGLE = {
    '1': 3 * Math.PI / 4,
    '2': Math.PI / 2,
    '3': Math.PI / 4,
    '4': Math.PI,
    '6': 0,
    '7': 5 * Math.PI / 4,
    '8': 3 * Math.PI / 2,
    '9': 7 * Math.PI / 4,
};

export const getAngleFromDirection = dir => {
    const angle = DIR_8_TO_ANGLE[dir];
    if (angle === undefined) throw new Error(`cannot determine angle from direction ${dir}`);
    return angle;
};

const normalizeAngle = angle => {
    angle = angle % (2 * Math.PI);
    angle += 2 * Math.PI; // assert positive angle
    return angle % (2 * Math.PI);
};

export const get8DirFromAngle = angle => {
    angle = normalizeAngle(angle);

    if (angle >= DIR_8_TO_ANGLE[9] || angle < DIR_8_TO_ANGLE[3]) return 6;
    else if (angle >= DIR_8_TO_ANGLE[3] && angle < DIR_8_TO_ANGLE[1]) return 2;
    else if (angle >= DIR_8_TO_ANGLE[1] && angle < DIR_8_TO_ANGLE[7]) return 4;
    return 8;
};

export const get8DirFromHorzVert = (horz, vert) => {
    if (isUp(vert)) {
        if (isLeft(horz)) return 7;
        else if (isRight(horz)) return 9;
        return vert;
    } else if (isDown(vert)) {
        if (isLeft(horz)) return 1;
        else if (isRight(horz)) return 3;
        return vert;
    } else {
        return horz;
    }
};

export const get8DirFromVector = ({ x, y }) => {
    // ignore x or y component when its less than half its counterpart
    if (Math.abs(x) > Math.abs(y) * 2) {
        y = 0;
    } else if (Math.abs(y) > Math.abs(x) * 2) {
        x = 0;
    }
    const horz = x > 0 ? 6 : x < 0 ? 4 : 0;
    const vert = y > 0 ? 2 : y < 0 ? 8 : 0;
    return get8DirFromHorzVert(horz, vert);
};