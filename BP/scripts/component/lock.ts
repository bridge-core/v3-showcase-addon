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

    const dynamicProperties = block.getComponent('minecraft:dynamic_properties')
    const roomId = dynamicProperties.get('survival:room_id') as number ?? -1

    RoundManager.roomManager.unlockRoom(roomId)
}