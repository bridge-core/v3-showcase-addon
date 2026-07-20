export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min
}