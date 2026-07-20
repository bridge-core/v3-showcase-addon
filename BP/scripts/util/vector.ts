import { Vector3 } from '@minecraft/server'

export function add(vecA: Vector3, vecB: Vector3): Vector3 {
    return {
        x: vecA.x + vecB.x,
        y: vecA.y + vecB.y,
        z: vecA.z + vecB.z
    }
}

export function subtract(vecA: Vector3, vecB: Vector3): Vector3 {
    return {
        x: vecA.x - vecB.x,
        y: vecA.y - vecB.y,
        z: vecA.z - vecB.z
    }
}

export function distanceBetween(vecA: Vector3, vecB: Vector3): number {
    return length(subtract(vecA, vecB))
}

export function length(vec: Vector3): number {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z)
}

export function normalize(vec: Vector3): Vector3 {
    const l = length(vec)

    return {
        x: vec.x / l,
        y: vec.y / l,
        z: vec.z / l
    }
}