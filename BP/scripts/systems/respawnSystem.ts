import { world, EntityDieAfterEvent, system, Player, GameMode } from '@minecraft/server'

let ticker = -1

function onEntityDieAfter(event: EntityDieAfterEvent): void {
    const player = event.deadEntity

    player.addTag('dead')
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