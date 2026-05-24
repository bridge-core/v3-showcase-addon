import { world } from '@minecraft/server'

export class RoundManager {
    public static spawnPoints: { x: number, y: number, z: number }[] = []

    public static begin(difficulty: number) {
        world.getDimension('overworld').runCommand(`Say starting round! Difficulty ${difficulty}`)

        for (let i = 0; i < difficulty; i++) {
            world.getDimension('overworld').spawnEntity('minecraft:zombie', this.spawnPoints[0])
        }
    }
}