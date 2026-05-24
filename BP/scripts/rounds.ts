import { world, Vector3, system, CommandPermissionLevel, CustomCommandStatus } from '@minecraft/server'

export class RoundManager {
    public static spawnPoints: Vector3[] = []

    public static registerSpawnPoint(location: Vector3) {
        this.spawnPoints.push(location)
    }

    public static start(difficulty: number) {
        world.getDimension('overworld').runCommand(`Say starting round! Difficulty ${difficulty}`)

        let spawnPointQueue = [...this.spawnPoints]

        for (let i = 0; i < difficulty; i++) {
            if (spawnPointQueue.length === 0) {
                spawnPointQueue = [...this.spawnPoints]
            }

            const index = Math.floor(Math.random() * spawnPointQueue.length)
            const spawnPoint = spawnPointQueue[index]
            spawnPointQueue.splice(index, 1)

            world.getDimension('overworld').spawnEntity('minecraft:zombie', spawnPoint)
        }
    }
}

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
    customCommandRegistry.registerCommand(
        {
            name: 'bridge:start_round',
            description: 'Manually starts a round',
            permissionLevel: CommandPermissionLevel.Admin,
            cheatsRequired: true,
        },
        () => {
            RoundManager.start(5)

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
            world.getDimension('overworld').runCommand(`Registering spawn point at ${origin.sourceBlock.location}`)

            RoundManager.registerSpawnPoint(origin.sourceBlock.location)

            return {
                status: CustomCommandStatus.Success
            }
        }
    )
})