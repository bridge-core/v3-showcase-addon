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

export function getHeldItem(player: Player): ItemStack {
    const equippable = player.getComponent('minecraft:equippable')

    return equippable.getEquipment(EquipmentSlot.Mainhand)
}

export function setHeldItem(player: Player, stack: ItemStack): boolean {
    const equippable = player.getComponent('minecraft:equippable')

    return equippable.setEquipment(EquipmentSlot.Mainhand, stack)
}

export function decrementHeldItem(player: Player): boolean {
    const equippable = player.getComponent('minecraft:equippable')
    const slot = equippable.getEquipmentSlot(EquipmentSlot.Mainhand)

    return decrementItemAtSlot(slot)
}