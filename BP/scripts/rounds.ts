import { world, Vector3, system, CommandPermissionLevel, CustomCommandStatus, Entity } from '@minecraft/server'

export class RoundManager {
    public static spawnPoints: Vector3[] = []
    public static trackedEntities: string[] = []

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

            const entity = world.getDimension('overworld').spawnEntity('minecraft:zombie', spawnPoint)
            this.trackedEntities.push(entity.id)
        }
    }

    public static debug() {
        for (const spawnPoint of this.spawnPoints) {
            world.getDimension('overworld').spawnParticle('minecraft:blue_flame_particle', spawnPoint)
        }
    }

    public static onEntityDie(entity: Entity) {
        if (!this.trackedEntities.includes(entity.id)) return

        this.trackedEntities.splice(this.trackedEntities.indexOf(entity.id), 1)

        if (this.trackedEntities.length > 0) return

        world.getDimension('overworld').runCommand(`say Round complete!`)
    }
}

system.runInterval(() => {
    RoundManager.debug()
}, 10)

world.afterEvents.entityDie.subscribe(event => {
    RoundManager.onEntityDie(event.deadEntity)
})

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
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