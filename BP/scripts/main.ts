import { world, system } from '@minecraft/server'
import { Round } from './rounds'

system.run(() => {
    const round = new Round()
    round.begin()
})