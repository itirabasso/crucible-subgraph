
import { Address, BigInt, ByteArray, dataSource, json, JSONValue, log, TypedMap } from "@graphprotocol/graph-ts";
import { AludelFunded__Params } from "../generated/templates/AludelV15Template/AludelV15";
import { formatAddress } from "./utils";

const NETWORK_NAME = dataSource.network()

// TODO : upload this to ipfs
// let levelsConfig: {
//     mainnet: {
//         basic: {
//             crucibleFactory: '0x54e0395CFB4f39beF66DBCd5bD93Cca4E9273D56'
//         },
//         pro: {
//             minter: '0x075d940Fa6878c6164f3F44CFc584923c4F5654C'
//         },
//         platinum: {
//             transmuter: '0xB772ce9f14FC7C7db0D4525aDb9349FBD7ce456a'
//         }
//     },
//     rinkeby: {
//         basic: {
//             crucibleFactory: '0xf92D86483438BDe1d68e501ce15470155DeE08B3'
//         },
//         pro: {
//             minter: '0x45522b727d50258780c3DE972b299D1CD69b20d4'
//         },
//         platinum: {
//             transmuter:'0x0ADc14De42436aD95747a1C9A8002D4E60888ACa'
//         }
//     },
// }

const LEVELS = new TypedMap<string, TypedMap<string, string> >()

const mainnetLevels = new TypedMap<string, string>()
mainnetLevels.set("0x54e0395CFB4f39beF66DBCd5bD93Cca4E9273D56".toLowerCase(), 'Basic')
mainnetLevels.set("0x075d940Fa6878c6164f3F44CFc584923c4F5654C".toLowerCase(), 'Pro')
mainnetLevels.set("0xB772ce9f14FC7C7db0D4525aDb9349FBD7ce456a".toLowerCase(), 'Platinum')

LEVELS.set('mainnet', mainnetLevels)

const rinkebyLevels = new TypedMap<string, string>()
rinkebyLevels.set("0xf92D86483438BDe1d68e501ce15470155DeE08B3".toLowerCase(), 'Basic')
rinkebyLevels.set("0x45522b727d50258780c3DE972b299D1CD69b20d4".toLowerCase(), 'Pro')
rinkebyLevels.set("0x0ADc14De42436aD95747a1C9A8002D4E60888ACa".toLowerCase(), 'Platinum')

LEVELS.set('rinkeby', rinkebyLevels)

// const LEVELS = getLevels()

export function getLevel(address: Address): string {
    let levels = LEVELS.get(NETWORK_NAME)
    
    if (levels != null) {
        // if (address == null) return'unknown'
        let level = levels.get(formatAddress(address))
        if (level === null) {
            log.warning('crucible created with unknown contract: {}', [address.toHexString()])
            return 'Unknown'
        } else {
            return level 
        }
    } else {
        log.error('invalid level', [])
        return 'Unknown'
    }
}

const ALUDELS = new TypedMap<string, Address[]>()

ALUDELS.set(
    'mainnet',
    [
        Address.fromString('0x93c31fc68E613f9A89114f10B38F9fd2EA5de6BC')
    ]
)
ALUDELS.set(
    'rinkeby',
    [
        Address.fromString('0x6Edb9A98DdBc1ad7Bb9AA56463318E6FE608a6b6')
    ]
)

export function getAludels(): Address[] {
    let aludels = ALUDELS.get(NETWORK_NAME)
    if (aludels == null) {
        log.error('unable to retrieve aludels', [])
        return []
    }

    return aludels
}