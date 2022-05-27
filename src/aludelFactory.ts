import { dataSource, log, store } from "@graphprotocol/graph-ts";
import { AludelFactory, InstanceAdded, InstanceRemoved, TemplateAdded, TemplateUpdated } from "../generated/AludelFactory/AludelFactory";
import { RewardProgram, Template } from "../generated/schema";
import { AludelV15Template } from "../generated/templates";
import { AludelV15 } from "../generated/templates/AludelV15Template/AludelV15";
import { getAludelId, getIdFromAddress } from "./utils";

export function handleInstanceAdded(event: InstanceAdded): void {
  let aludelAddress = event.params.instance
  AludelV15Template.create(aludelAddress)
  let aludelId = getAludelId(aludelAddress)


  let factory = AludelFactory.bind(dataSource.address())
  let data = factory.try_getProgram(aludelAddress)
  if (data.reverted) {
    log.error("handleInstanceAdded: failed get program data: {}", [aludelAddress.toHexString()]);
    return;
  }

  let rewardProgram = new RewardProgram(aludelId)

  let aludel = AludelV15.bind(aludelAddress)
  let owner = aludel.try_owner()
  if (owner.reverted) {
    log.error("handleInstanceAdded: failed get program's owner: {}", [aludelAddress.toHexString()]);
  } else {
    rewardProgram.owner = owner.value;
  }

  rewardProgram.template = data.value.template
  rewardProgram.url = data.value.url
  rewardProgram.stakingTokenUrl = data.value.stakingTokenUrl
  rewardProgram.creation = data.value.creation
  rewardProgram.name = data.value.name
  rewardProgram.save()
 }

 export function handleInstanceRemoved(event: InstanceRemoved): void {
  let aludelAddress = event.params.instance
  AludelV15Template.create(aludelAddress)  
  let aludelId = getAludelId(aludelAddress)
  store.remove('RewardProgram', aludelId)
 }

export function handleTemplateAdded(event: TemplateAdded): void {
  let id = getIdFromAddress(event.params.template)
  let template = new Template(id)
  template.disabled = false
  template.save()
}
export function handleTemplateUpdated(event: TemplateUpdated): void {
  let id = getIdFromAddress(event.params.template);
  let template = Template.load(id)
  if (template === null) {
    log.error('handleTemplateUpdate: cannot load template with id', [id])
    return;
  }
  template.disabled = event.params.disabled
  template.save()
}