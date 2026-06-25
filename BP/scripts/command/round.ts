import { system, Entity, CustomCommandOrigin, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, CustomCommandResult } from '@minecraft/server'
import { RoundManager } from '../roundManager'

function execute(source: CustomCommandOrigin, option: string): CustomCommandResult {
    const entity = source.sourceEntity

    switch (option) {
        case 'start': {
            return executeStart(entity)
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

function executeStart(entity: Entity): CustomCommandResult {
    if (!RoundManager.canStart()) {
        return {
            status: CustomCommandStatus.Failure,
            message: 'Failed to start round'
        }
    }

    system.run(() => RoundManager.start(entity.dimension, 5))

    return {
        status: CustomCommandStatus.Success,
        message: 'Round started'
    }
}

function executeStop(): CustomCommandResult {
    if (!RoundManager.isRoundActive()) {
        return {
            status: CustomCommandStatus.Failure,
            message: 'Failed to stop round'
        }
    }

    system.run(() => RoundManager.stop())

    return {
        status: CustomCommandStatus.Success,
        message: 'Round stopped'
    }
}

system.beforeEvents.startup.subscribe(event => {
    const registry = event.customCommandRegistry

    registry.registerEnum('survival:round_options', [
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
