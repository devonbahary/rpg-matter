/*
    7   8   9
    4       6
    1   2   3
*/

export const isUp = dir => [ 7, 8, 9 ].includes(dir);
export const isRight = dir => [ 3, 6, 9 ].includes(dir);
export const isDown = dir => [ 1, 2, 3].includes(dir);
export const isLeft = dir => [ 1, 4, 7].includes(dir);

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