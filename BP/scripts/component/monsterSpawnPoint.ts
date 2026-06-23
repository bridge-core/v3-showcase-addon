import { system } from '@minecraft/server'
import { RoundManager } from '../roundManager'

system.beforeEvents.startup.subscribe(event => {
    event.blockComponentRegistry.registerCustomComponent('v3:monster_spawn_point', {
        onPlace: (event) => RoundManager.registerSpawnPoint(event.block),
        onBreak: (event) => RoundManager.clearSpawnPoint(event.block)
    })
})