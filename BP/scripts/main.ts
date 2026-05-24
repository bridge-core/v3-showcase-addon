import { world, system } from '@minecraft/server'
import { RoundManager } from './rounds'

system.run(() => {
    RoundManager.spawnPoints.push(world.getPlayers()[0].location)

    RoundManager.start(5)
})