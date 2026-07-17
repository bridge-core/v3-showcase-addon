import { system, CustomCommandOrigin, CommandPermissionLevel, CustomCommandStatus, CustomCommandResult } from '@minecraft/server'
import { place } from '../systems/generationSystem'

function execute(source: CustomCommandOrigin, option: string): CustomCommandResult {
    system.run(() => {
        place(source.sourceEntity.location, source.sourceEntity.dimension)
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
