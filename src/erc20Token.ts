import { Address, BigInt, log, store, Value } from "@graphprotocol/graph-ts";

import { ERC20 } from "../generated/CrucibleFactory/ERC20";

import { ERC20Token } from "../generated/schema";
import { getTokenId } from "./utils";

export function createERC20Token(address: Address): ERC20Token {
  let tokenContract = ERC20.bind(address)
  let tokenId = getTokenId(address)
  let token = new ERC20Token(tokenId)

  token.address = address
  let decimals = tokenContract.try_decimals()
  if (decimals.reverted) {
    log.error("createERC20Token: failed get token decimals: {}", [tokenId]);
    // reviewme: this behavior may not be ideal.
    token.decimals = BigInt.fromI32(0)
  } else {
    token.decimals = BigInt.fromI32(decimals.value)
  }

  let name = tokenContract.try_name()
  if (name.reverted) {
    log.error("createERC20Token: failed get token name: {}", [tokenId]);
    // reviewme: this behavior may not be ideal.
    token.name = ''
  } else {
    token.name = name.value
  }

  let symbol = tokenContract.try_symbol()
  if (symbol.reverted) {
    log.error("createERC20Token: failed get token symbol: {}", [tokenId]);
    // reviewme: this behavior may not be ideal.
    token.symbol = ''
  } else {
    token.symbol = symbol.value
  }

  token.save()

  return token
}
