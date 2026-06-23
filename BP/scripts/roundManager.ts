import { world, system, Vector3, Entity, Dimension } from '@minecraft/server'

const DEBUG: boolean = true

export class RoundManager {
    private static dimension: Dimension | null = null
    private static difficulty: number = 0
    private static wave: number = 0
    private static spawnPoints: Set<Vector3> = new Set()
    private static trackedEntities: string[] = []
    private static tickerId: number = 0
    private static active: boolean = false

    public static canStart(): boolean {
        return this.spawnPoints.size > 0 && !this.active
    }

    public static start(dimension: Dimension, difficulty: number) {
        world.sendMessage(`Starting round with ${difficulty} difficulty.`)

        this.dimension = dimension
        this.difficulty = difficulty
        this.tickerId = system.runInterval(() => this.tick())
        this.active = true

        this.incrementWave()
    }

    public static stop() {
        system.clearRun(this.tickerId)

        this.dimension = null
        this.difficulty = 0
        this.wave = 0
        this.trackedEntities = []
        this.tickerId = 0
        this.active = false
    }

    public static registerSpawnPoint(location: Vector3) {
        this.spawnPoints.add(location)
    }

    public static clearSpawnPoint(location: Vector3) {
        this.spawnPoints.delete(location)
    }

    private static tick(): void {
        if (DEBUG && system.currentTick % 10 === 0) {
            for (const spawnPoint of this.spawnPoints) {
                this.dimension.spawnParticle('minecraft:blue_flame_particle', spawnPoint)
            }
        }
    }

    private static incrementWave(): void {
        const waveDifficulty = this.difficulty * (1 + this.wave)

        let spawnPointQueue = [...this.spawnPoints]

        for (let i = 0; i < waveDifficulty; i++) {
            if (spawnPointQueue.length === 0) {
                spawnPointQueue = [...this.spawnPoints]
            }

            const index = Math.floor(Math.random() * spawnPointQueue.length)
            const spawnPoint = spawnPointQueue[index]
            spawnPointQueue.splice(index, 1)

            const entity = this.dimension.spawnEntity('minecraft:zombie', spawnPoint)
            this.trackedEntities.push(entity.id)
        }
    }

    public static onEntityDie(entity: Entity) {
        if (!this.trackedEntities.includes(entity.id)) return

        this.trackedEntities.splice(this.trackedEntities.indexOf(entity.id), 1)

        if (this.trackedEntities.length > 0) return

        world.sendMessage('Round complete!')

        this.incrementWave()
    }

    public static isRoundActive(): boolean {
        return this.active
    }
}

world.afterEvents.entityDie.subscribe(event => {
    RoundManager.onEntityDie(event.deadEntity)
})

