import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";
import {
  InstanceAdded,
  InstanceRemoved,
  Transfer,
} from "../generated/CrucibleFactory/CrucibleFactory";

import { Counters, CrucibleEntity } from "../generated/schema";
import { CrucibleTemplate } from "../generated/templates";
import {
  getCrucibleId,
  getCrucibleIdFromTokenId,
  isAddressZero,
} from "./utils";

export function handleInstanceAdded(event: InstanceAdded): void {
  CrucibleTemplate.create(event.params.instance);

  let crucibleAddress = event.params.instance;
  let owner = event.address;
  
  let crucibleId = getCrucibleId(crucibleAddress);
  let crucible = new CrucibleEntity(crucibleId);
  
  crucible.owner = owner;
  crucible.timestamp = event.block.timestamp;
  crucible.index = getCrucibleCounter();
  
  crucible.txhash = event.transaction.hash;
  crucible.blockNumber = event.block.number;
  
  crucible.save();

  bumpCrucibleCounter();
}

function getCrucibleCounter(): BigInt {
  let counter = Counters.load("crucible-counter");
  if (counter == null) {
    return BigInt.fromI32(0)
  }
  return counter.count 
}

function bumpCrucibleCounter(): Counters {
  // find a way to create an initialization method
  let counter = Counters.load("crucible-counter");
  if (counter == null) {
    counter = new Counters("crucible-counter");
  }
  counter.count = counter.count.plus(BigInt.fromI32(1));
  counter.save();
  return counter;
}

export function handleTransfer(event: Transfer): void {
  let from = event.params.from;
  let to = event.params.to;
  let tokenId = event.params.tokenId;

  // creation
  if (isAddressZero(from)) {
  }
  // transfer
  if (!isAddressZero(to) && !isAddressZero(from)) {
    let id = getCrucibleIdFromTokenId(tokenId);
    let crucible = CrucibleEntity.load(id);
    if (crucible != null) {
      crucible.owner = to;
      crucible.save();
    } else {
      log.error("crucibleTransfer: crucible {} not found", [id]);
    }
  }
}
