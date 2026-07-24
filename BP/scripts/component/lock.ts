import { BlockComponentPlayerInteractEvent, system, BlockVolume, EquipmentSlot, BlockDynamicPropertiesComponent } from '@minecraft/server'
import { RoundManager } from '../roundManager'
import { decrementItemAtSlot } from '../util/inventory'

system.beforeEvents.startup.subscribe(event => {
    event.blockComponentRegistry.registerCustomComponent('survival:lock', {
        onPlayerInteract: (event) => clearDoor(event)
    })
})

function clearDoor(lockEvent: BlockComponentPlayerInteractEvent) {
    const block = lockEvent.block
    const dimension = lockEvent.dimension

    const equippable = lockEvent.player.getComponent('minecraft:equippable')

    const mainhandSlot = equippable.getEquipmentSlot(EquipmentSlot.Mainhand)
    if (!mainhandSlot.hasItem() || mainhandSlot.typeId !== 'survival:key') {
        dimension.playSound('vault.insert_item_fail', block.center())

        return
    }

    dimension.playSound('vault.insert_item', block.center())
    decrementItemAtSlot(mainhandSlot)

    const dynamicProperties: any = lockEvent.block.getComponent("minecraft:dynamic_properties")

    const roomId = JSON.parse((dynamicProperties as BlockDynamicPropertiesComponent).get("structureData") as string).room_id

    RoundManager.roomManager.unlockRoom(roomId)

    lockEvent.dimension.fillBlocks(new BlockVolume(lockEvent.block.location, { x: lockEvent.block.location.x, y: lockEvent.block.location.y - 1, z: lockEvent.block.location.z }), "minecraft:air")
}