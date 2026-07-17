import { world, Vector3, Dimension } from '@minecraft/server'

export function place(location: Vector3, dimension: Dimension) {
    world.tickingAreaManager.createTickingArea("survival:structure_area", {
        dimension,
        from: {
            x: location.x - 100,
            y: location.y,
            z: location.z - 100
        },
        to: {
            x: location.x + 100,
            y: location.y,
            z: location.z + 100
        }
    }).then(() => {
        world.structureManager.placeJigsawStructure("survival:start", world.getDimension("overworld"), location)
    })
}