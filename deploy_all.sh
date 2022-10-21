#!/bin/bash


NETWORKS=fuji,mumbai,goerli,avalanche,polygon,mainnet

yarn codegen

# Use comma as separator and apply as pattern
for network in ${NETWORKS//,/ }
do
   yarn prepare-subgraph $network
   yarn deploy $network
done