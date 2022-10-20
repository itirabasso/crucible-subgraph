import { Address, ByteArray, dataSource, TypedMap } from "@graphprotocol/graph-ts";

const NETWORK_NAME = dataSource.network()

const CRUCIBLE_FACTORIES = new TypedMap<string, string>()

CRUCIBLE_FACTORIES.set('mainnet', '0x54e0395CFB4f39beF66DBCd5bD93Cca4E9273D56')
CRUCIBLE_FACTORIES.set('goerli', '0xB54AaD626C2B93878d82d7B5AB9704de10D9E816')
CRUCIBLE_FACTORIES.set('avalanche', '0x6D07709A30fcE07901B2a6D8e1D6E6ac17eb96De')
CRUCIBLE_FACTORIES.set('fuji', '0x4a8eC6b46EBb1A69480Ad0E6f70cF51fb7a39F74')
CRUCIBLE_FACTORIES.set('matic', '0xE2dD7930d8cA478d9aA38Ae0F5483B8A3B331C40')
CRUCIBLE_FACTORIES.set('mumbai', '0x5D15d226303cB96AC2EA7f760a313eA6bB36C508')

export function getCrucibleFactoryAddress(): Address {
    let address = CRUCIBLE_FACTORIES.get(NETWORK_NAME)
    if (address === null) {
        return Address.zero()
    }
    return Address.fromString(address.toLowerCase())
}
