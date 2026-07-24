import { world, Vector3, BlockVolume, ListBlockVolume } from '@minecraft/server'
import { RoundManager } from './roundManager'

type Room = {
    id: number,
    volume: BlockVolume,
    name: string,
    locked: boolean
}

export class RoomManager {
    public rooms: Room[] = []

    public async addRoom(vol: BlockVolume, name: string) {
        const room: Room = {
            id: this.rooms.length,
            volume: vol,
            name: name,
            locked: name == 'start' ? false : true
        }

        this.rooms.push(room)
        this.registerLocks(room)

        if (room.name == 'start') {
            this.unlockRoom(room.id)
        }
    }

    public unlockRoom(roomId: number) {
        const room: Room = this.rooms[roomId]

        this.clearLocks(room)
        this.registerPlayerSpawnPoints(room)
        this.registerMonsterSpawnPoints(room)
    }

    private registerLocks(room: Room): void {
        const dimension = world.getDimension('overworld')

        const locks = dimension.getBlocks(room.volume, {
            includeTypes: ['survival:lock']
        })

        for (const pos of locks.getBlockLocationIterator()) {
            const block = dimension.getBlock(pos)
            const dynamicProperties = block.getComponent('minecraft:dynamic_properties')

            dynamicProperties.set('spark_pp:room_id', room.id)

            console.log(`Registered lock at ${pos.x} ${pos.y} ${pos.z}`)
        }
    }

    private clearLocks(room: Room): void {
        const locks = world.getDimension("overworld").getBlocks(room.volume, {
            includeTypes: ['survival:lock']
        })

        for (const pos of locks.getBlockLocationIterator()) {
            console.log(`Clearing lock at ${pos.x} ${pos.y} ${pos.z}`)

            const clearArea: Vector3 = {
                x: pos.x,
                y: pos.y - 1,
                z: pos.z
            }

            const volume = new BlockVolume(pos, clearArea)

            world.getDimension("overworld").fillBlocks(volume, 'minecraft:air')
        }
    }

    private registerMonsterSpawnPoints(room: Room): void {
        const spawnPoints: ListBlockVolume = world.getDimension("overworld").getBlocks(room.volume, {
            includeTypes: ['survival:monster_spawn_point']
        })

        for (const pos of spawnPoints.getBlockLocationIterator()) {
            console.log(`Registering monster spawn point at ${pos.x} ${pos.y} ${pos.z}`)

            world.getDimension("overworld").setBlockType(pos, 'minecraft:air')

            RoundManager.registerMonsterSpawnPoint(pos)
        }
    }

    private registerPlayerSpawnPoints(room: Room): void {
        const dimension = world.getDimension('overworld')

        const spawnPoints: ListBlockVolume = dimension.getBlocks(room.volume, {
            includeTypes: ['survival:player_spawn_point']
        })

        for (const pos of spawnPoints.getBlockLocationIterator()) {
            console.log(`Registering player spawn point at ${pos.x} ${pos.y} ${pos.z}`)

            dimension.setBlockType(pos, 'minecraft:air')

            RoundManager.registerPlayerSpawnPoint(pos)
        }
    }

    public reset() {
        this.rooms.length = 0
    }
}