import { world, ItemStack } from "@minecraft/server";

export function initiatePlayerStartKit() {
    const playerStartKit: { name: string, amount: number }[] = [
        {
            name: "minecraft:stone_sword",
            amount: 1
        },
        {
            name: "minecraft:bread",
            amount: 10
        }
    ]

    for (const player of world.getPlayers()) {
        for (const kitItem of playerStartKit) {
            player.addItem(new ItemStack(kitItem.name, kitItem.amount))
        }
    }
}