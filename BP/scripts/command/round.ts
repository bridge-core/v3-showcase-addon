import { system, Entity, CustomCommandOrigin, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, CustomCommandResult } from '@minecraft/server'
import { RoundManager } from '../roundManager'

function execute(source: CustomCommandOrigin, option: string): CustomCommandResult {
    const entity = source.sourceEntity

    switch (option) {
        case 'load': {
            return executeLoad(entity)
        }
        case 'start': {
            return executeStart()
        }
        case 'stop': {
            return executeStop()
        }
        default: {
            return {
                status: CustomCommandStatus.Success,
                message: `Subcommand "${option}" not found.`
            }
        }
    }
}

function executeLoad(entity: Entity): CustomCommandResult {
    system.run(() => RoundManager.load(entity.dimension))

    return {
        status: CustomCommandStatus.Success,
        message: 'Executed load!'
    }
}

function executeStart(): CustomCommandResult {
    system.run(() => RoundManager.start())

    return {
        status: CustomCommandStatus.Success,
        message: 'Executed start!'
    }
}

function executeStop(): CustomCommandResult {
    system.run(() => RoundManager.stop())

    return {
        status: CustomCommandStatus.Success,
        message: 'Executed stop!'
    }
}

system.beforeEvents.startup.subscribe(event => {
    const registry = event.customCommandRegistry

    registry.registerEnum('survival:round_options', [
        'load',
        'start',
        'stop'
    ])

    registry.registerCommand(
        {
            name: 'survival:round',
            description: 'Manages the round',
            permissionLevel: CommandPermissionLevel.Admin,
            cheatsRequired: true,
            mandatoryParameters: [
                {
                    type: CustomCommandParamType.Enum,
                    name: 'survival:round_options'
                }
            ]
        },
        execute
    )
})
