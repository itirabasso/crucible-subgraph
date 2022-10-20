import { BigInt, log } from "@graphprotocol/graph-ts";
import {
  InstanceAdded,
  Transfer,
} from "../generated/CrucibleFactory/CrucibleFactory";
import { Counters, CrucibleEntity, Leaderboard } from "../generated/schema";
import { CrucibleTemplate } from "../generated/templates";
import { getCrucibleFactoryAddress } from "./config";
import { getCrucibleIdFromTokenId, isAddressZero } from "./utils";

export function handleInstanceAdded(event: InstanceAdded): void {
  CrucibleTemplate.create(event.params.instance);
}

function getCrucibleCounter(): BigInt {
  let counter = Counters.load("crucible-counter");
  if (counter == null) {
    return BigInt.fromI32(0);
  }
  return counter.count;
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

function createCrucible(event: Transfer): void {
  let to = event.params.to;
  let tokenId = event.params.tokenId;

  let id = getCrucibleIdFromTokenId(tokenId);
  let entity = new CrucibleEntity(id);
  entity.timestamp = event.block.timestamp;
  entity.owner = to;
  entity.blockNumber = event.block.number;
  entity.factory = event.address;

  if (getCrucibleFactoryAddress() == entity.factory) {
    entity.index = getCrucibleCounter();
    bumpCrucibleCounter();
  }
  entity.rewardsLength = BigInt.fromI32(0);
  entity.save();

  let leaderboard = new Leaderboard(id);
  leaderboard.points = BigInt.fromI32(0);
  leaderboard.save();
}

export function handleTransfer(event: Transfer): void {
  let from = event.params.from;
  let to = event.params.to;
  let tokenId = event.params.tokenId;

  // creation
  if (isAddressZero(from)) {
    createCrucible(event);
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
