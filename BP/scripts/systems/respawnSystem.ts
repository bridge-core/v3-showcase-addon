import { world, EntityDieAfterEvent, system, Player, GameMode } from '@minecraft/server'

let ticker = -1

function onEntityDieAfter(event: EntityDieAfterEvent): void {
    const player = event.deadEntity
    const location = player.location
    const dimension = player.dimension

    player.addTag('dead')

    dimension.runCommand(`spawnpoint ${player.nameplateRenderDistance} ${location.x} ${location.y} ${location.z}`)
}

function onTick(): void {
    const deadPlayers = world.getPlayers({
        tags: ['dead'],
        excludeGameModes: [GameMode.Spectator]
    })

    for (const player of deadPlayers) {
        player.setGameMode(GameMode.Spectator)
    }
}

export function createRespawnSystem(): void {
    world.gameRules.doImmediateRespawn = true

    world.afterEvents.entityDie.subscribe(onEntityDieAfter, {
        entityTypes: ['minecraft:player']
    })
    ticker = system.runInterval(onTick)

    cleanUpPlayers()
}

export function destroyRespawnSystem(): void {
    world.afterEvents.entityDie.unsubscribe(onEntityDieAfter)
    system.clearRun(ticker)
}

export function cleanUpPlayers(): void {
    const deadPlayers = world.getPlayers({
        tags: ['dead']
    })

    deadPlayers.forEach(player => player.removeTag('dead'))
}