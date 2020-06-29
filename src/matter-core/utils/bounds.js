export const createBounds = (minX, maxX, minY, maxY) => ({
    min: {
        x: minX,
        y: minY,
    },
    max: {
        x: maxX,
        y: maxY,
    },
});

export function squareInFrontOf(range = 1) {
    switch (this._direction) {
        case 2:
            return createBounds(
                this.x - (this.width / 2),
                this.x + (this.width / 2),
                this.y,
                this.y + range,
            );
        case 4: 
            return createBounds(
                this.x - range,
                this.x,
                this.y - (this.height / 2),
                this.y + (this.height / 2),
            );
        case 6:
            return createBounds(
                this.x,
                this.x + range,
                this.y - (this.height / 2),
                this.y + (this.height / 2),
            );
        case 8:
            return createBounds(
                this.x - (this.width / 2),
                this.x + (this.width / 2),
                this.y - range,
                this.y,
            );
    }
    throw new Error(`couldn't generate squareInFrontOf(), direction = ${this._direction}`);
};

export function squareAround(range = 1) {
    const d = range / 2;
    return createBounds(this.x - d, this.x + d, this.y - d, this.y + d);
};