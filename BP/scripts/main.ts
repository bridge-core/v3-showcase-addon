import { world, system, CommandPermissionLevel, CustomCommandStatus } from '@minecraft/server'
import { RoundManager } from './rounds'
import './entity/plankGolem'

// RoundManager.registerSpawnPoint({ x: 0, y: 0, z: 0 })

system.beforeEvents.startup.subscribe(({ customCommandRegistry, blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent('bridge:enemy_spawn_point', {
        onTick(event) {
            RoundManager.registerSpawnPoint(event.block.location)
        }
    })

    customCommandRegistry.registerCommand(
        {
            name: 'bridge:start_round',
            description: 'Manually starts a round',
            permissionLevel: CommandPermissionLevel.Admin,
            cheatsRequired: true,
        },
        () => {
            system.run(() => {
                RoundManager.start(5)
            })

            return {
                status: CustomCommandStatus.Success
            }
        }
    )

    customCommandRegistry.registerCommand(
        {
            name: 'bridge:register_spawn_point',
            description: 'Registers a spawn point to the round manager',
            permissionLevel: CommandPermissionLevel.Admin,
            cheatsRequired: true,
        },
        origin => {
            system.run(() => {
                world.getDimension('overworld').runCommand(`say Registering spawn point at ${origin.sourceEntity.location}`)
            })

            RoundManager.registerSpawnPoint(origin.sourceEntity.location)

            return {
                status: CustomCommandStatus.Success
            }
        }
    )
})