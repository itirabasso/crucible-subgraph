
import { Address, BigInt, ByteArray, dataSource, log, TypedMap } from "@graphprotocol/graph-ts";

const NETWORK_NAME = dataSource.network()

// const levelsConfig = {
//     mainnet: {
//         basic: [Address.fromString('0x54e0395CFB4f39beF66DBCd5bD93Cca4E9273D56')],
//         pro: [Address.fromString('0x075d940Fa6878c6164f3F44CFc584923c4F5654C')],
//         platinum: [Address.fromString('0xB772ce9f14FC7C7db0D4525aDb9349FBD7ce456a')]
//     },
//     rinkeby: {
//         basic: [Address.fromString('0xf92D86483438BDe1d68e501ce15470155DeE08B3')],
//         pro: [Address.fromString('0x45522b727d50258780c3DE972b299D1CD69b20d4')],
//         platinum: [Address.fromString('0x0ADc14De42436aD95747a1C9A8002D4E60888ACa')]
//     },
// }

const levelsConfig = {
    mainnet: {
        basic: {
            crucibleFactory: '0x54e0395CFB4f39beF66DBCd5bD93Cca4E9273D56'
        },
        pro: {
            minter: '0x075d940Fa6878c6164f3F44CFc584923c4F5654C'
        },
        platinum: {
            transmuter: '0xB772ce9f14FC7C7db0D4525aDb9349FBD7ce456a'
        }
    },
    rinkeby: {
        basic: {
            crucibleFactory: '0xf92D86483438BDe1d68e501ce15470155DeE08B3'
        },
        pro: {
            minter: '0x45522b727d50258780c3DE972b299D1CD69b20d4'
        },
        platinum: {
            transmuter:'0x0ADc14De42436aD95747a1C9A8002D4E60888ACa'
        }
    },
}


// function getLevels(): TypedMap<string, string> {
//     let levels = new TypedMap<string, string>()

//     let config = Object.entries(levelsConfig).find(([key, value]) => key == NETWORK_NAME) [0]
//     Object.entries(levelsConfig).forEach(([key, value]) => )
//     Object.entries(config).forEach(([address, level]) => {
//         levels.set(address, level)
//     })
// }

const LEVELS = new TypedMap<string, TypedMap<string, string> >()

const mainnetLevels = new TypedMap<string, string>()
// mainnetLevels.set('basic', '0x54e0395CFB4f39beF66DBCd5bD93Cca4E9273D56')
// mainnetLevels.set('pro', '0x075d940Fa6878c6164f3F44CFc584923c4F5654C')
// mainnetLevels.set('platinum', '0xB772ce9f14FC7C7db0D4525aDb9349FBD7ce456a')
mainnetLevels.set(levelsConfig.mainnet.basic.crucibleFactory.toLowerCase(), 'Basic')
mainnetLevels.set(levelsConfig.mainnet.pro.minter.toLowerCase(), 'Pro')
mainnetLevels.set(levelsConfig.mainnet.platinum.transmuter.toLowerCase(), 'Platinum')

LEVELS.set('mainnet', mainnetLevels)

const rinkebyLevels = new TypedMap<string, string>()
// rinkebyLevels.set('basic', '0xf92D86483438BDe1d68e501ce15470155DeE08B3')
// rinkebyLevels.set('pro', '0x45522b727d50258780c3DE972b299D1CD69b20d4')
// rinkebyLevels.set('platinum', '0x0ADc14De42436aD95747a1C9A8002D4E60888ACa')
rinkebyLevels.set(levelsConfig.mainnet.basic.crucibleFactory.toLowerCase(), 'Basic')
rinkebyLevels.set(levelsConfig.mainnet.pro.minter.toLowerCase(), 'Pro')
rinkebyLevels.set(levelsConfig.mainnet.platinum.transmuter.toLowerCase(), 'Platinum')

LEVELS.set('rinkeby', rinkebyLevels)

// const LEVELS = getLevels()

export function getLevel(address: Address): string {
    let levels = LEVELS.get(NETWORK_NAME)
    
    if (levels != null) {
        // if (address == null) return'unknown'
        let level = levels.get(address.toHexString().toLowerCase())
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