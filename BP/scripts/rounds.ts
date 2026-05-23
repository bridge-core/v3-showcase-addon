import { world } from '@minecraft/server'

export class Round {
    public begin() {
        world.getDimension('overworld').runCommand('Say starting round!')
    }
}