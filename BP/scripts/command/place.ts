import { system, world, Entity, CustomCommandOrigin, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, CustomCommandResult } from '@minecraft/server'
import { RoundManager } from '../roundManager'

function execute(source: CustomCommandOrigin, option: string): CustomCommandResult {

    system.run(() => {
        world.tickingAreaManager.createTickingArea("survival:structure_area", {
            dimension: world.getDimension("overworld"),
            from: {
                x: source.sourceEntity.location.x - 100,
                y: source.sourceEntity.location.y,
                z: source.sourceEntity.location.z - 100
            },
            to: {
                x: source.sourceEntity.location.x + 100,
                y: source.sourceEntity.location.y,
                z: source.sourceEntity.location.z + 100
            }
        }).then(() => {
            world.structureManager.placeJigsawStructure("survival:start", world.getDimension("overworld"), source.sourceEntity.location)
        })
    })

    return {
        status: CustomCommandStatus.Success,
        message: 'Structure Placed'
    }
}


system.beforeEvents.startup.subscribe(event => {
    const registry = event.customCommandRegistry

    registry.registerCommand(
        {
            name: 'survival:place',
            description: 'PLACE IT BUB',
            permissionLevel: CommandPermissionLevel.Admin,
            cheatsRequired: true
        },
        execute
    )
})
