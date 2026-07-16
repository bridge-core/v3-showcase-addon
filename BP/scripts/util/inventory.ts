import { ContainerSlot, ItemStack, EquipmentSlot, Player } from '@minecraft/server'

export function decrementItemAtSlot(slot: ContainerSlot): boolean {
    if (!slot.hasItem()) return false

    const stack = slot.getItem()

    let newStack: ItemStack = undefined

    if (stack.amount - 1 > 0) {
        newStack = stack.clone()
        newStack.amount--
    }

    slot.setItem(newStack)

    return true
}

export function decrementHeldItem(player: Player): boolean {
    const equippable = player.getComponent('minecraft:equippable')
    const slot = equippable.getEquipmentSlot(EquipmentSlot.Mainhand)

    return decrementItemAtSlot(slot)
}