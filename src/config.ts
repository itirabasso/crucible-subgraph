import { dataSource, log, TypedMap } from "@graphprotocol/graph-ts";

const NETWORK_NAME = dataSource.network()

const ALUDELS = new TypedMap<string, string[]>()

ALUDELS.set(
    'mainnet',
    [
        "0xf0D415189949d913264A454F57f4279ad66cB24d",
        "0x93c31fc68E613f9A89114f10B38F9fd2EA5de6BC",
        "0x56eD0272f99eBD903043399A51794f966D72E526",
        "0x914A766578C2397da969b3ca088e3e757249A435",
        "0x0ec93391752ef1A06AA2b83D15c3a5814651C891",
        "0x88F12aE68315A89B885A2f1b0610fE2A9E1720B9",
        "0x1Fee4745E70509fBDc718beDf5050F471298c1CE",
        "0x872b09f22873Dd22A1CB20c7D7120844650D1B9a",
        "0x1C8c8aF39d69a497943015833E3a7Ae102D1E2BD",
        "0x004BA6820A30A2c7B6458720495fb1eC5b5f7823",
        "0xa4DC59bAE0Ca1A0e52DAC1885199A2Fb53B3ABE3",
        "0x2230ad29920D61A535759678191094b74271f373",
        "0x56DC5199e6664cBAa63b7897854A2677999132C7",
        "0x71bCC385406a8A4694Ccc0102f18DfDd59c08d2E",
        "0xF2301F29344499727bf69F22980ba667194e6D4d",
        "0x5C20CEfc5161092Fa295a89E34D3B2bfe66e1E79",
        "0xc1F5D0b6617D8EFb951384509E759ac216745627",
        "0x89CA56d0D79815Eb896e180fc1b5c21FEdf074f7",
        "0x3d9246c38c9e8a22d1f4d2742e28ced721897647",
        "0x682D92516954840c702CFD85cB17B8A9f77fab5F",
        "0x3718f99751BCF8B1c63e0E7DE788f099dB43d65b"
    ]
)
ALUDELS.set(
    'rinkeby',
    [
        '0x6Edb9A98DdBc1ad7Bb9AA56463318E6FE608a6b6'
    ]
)

ALUDELS.set(
    'matic',
    [
        "0xeE58832B0a4fd753d6E6184C6bfe3E69019E64Ee",
        "0xFF7C0970dBc4b1fbdE29D814EbE1b5c5F3b11142"    
    ]
)

export function getAludels(): string[] {
    let aludels = ALUDELS.get(NETWORK_NAME)
    if (aludels == null) {
        log.error('unable to retrieve aludels for network {}', [NETWORK_NAME])
        return []
    }

    return aludels
}