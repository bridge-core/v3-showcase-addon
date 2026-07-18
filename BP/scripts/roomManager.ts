import { world, system, Vector3, Entity, Dimension, BlockVolume, ListBlockVolume, Block, BlockDynamicPropertiesComponent } from '@minecraft/server'
import { RoundManager } from './roundManager'

type Room = {
    id: number,
    volume: BlockVolume,
    name: string,
    locked: boolean
}

export class RoomManager {
    public rooms: Room[] = []
    private dimension: Dimension

    public constructor(dimension: Dimension) {
        this.dimension = dimension
    }

    public async addRoom(vol: BlockVolume, name: string) {
        const room: Room = {
            id: this.rooms.length,
            volume: vol,
            name: name,
            locked: name == "start" ? false : true
        }

        this.rooms.push(room)

        const dataBlocks: ListBlockVolume = world.getDimension("overworld").getBlocks(vol, {
            includeTypes: ["survival:lock", "survival:monster_spawn_point"]
        })

        for (const blockLocation of dataBlocks.getBlockLocationIterator()) {
            const dataBlock: Block = world.getDimension("overworld").getBlock(blockLocation)

            const dynamicProperties: any = dataBlock.getComponent("minecraft:dynamic_properties")

            const structureData = {
                room_id: room.id
            };

            (dynamicProperties as BlockDynamicPropertiesComponent).set("structureData", JSON.stringify(structureData))
        }

        world.sendMessage(room.name)

        if (name == "start") this.unlockRoom(room.id)
    }

    public unlockRoom(roomId: number) {
        const room: Room = this.rooms[roomId]

        this.clearLocks(room)
        this.registerMonsterSpawnPoints(room)
    }

    private clearLocks(room: Room): void {
        const locks = this.dimension.getBlocks(room.volume, {
            includeTypes: ['survival:lock']
        })

        for (const pos of locks.getBlockLocationIterator()) {
            console.log(`Clearing lock at ${pos.x} ${pos.y} ${pos.z}`)

            const clearArea: Vector3 = {
                x: pos.x,
                y: pos.y,
                z: pos.z
            }

            const volume = new BlockVolume(pos, clearArea)

            this.dimension.fillBlocks(volume, 'minecraft:air')
        }
    }

    private registerMonsterSpawnPoints(room: Room): void {
        const spawnPoints: ListBlockVolume = this.dimension.getBlocks(room.volume, {
            includeTypes: ['survival:monster_spawn_point']
        })

        for (const pos of spawnPoints.getBlockLocationIterator()) {
            console.log(`Registering spawn point at ${pos.x} ${pos.y} ${pos.z}`)

            this.dimension.setBlockType(pos, 'minecraft:air')

            RoundManager.registerSpawnPoint(pos)
        }
    }

    public reset() {
        this.rooms.length = 0
    }
}