## Install

```yarn```

## How to deploy a subgraph?

You need to create a JSON config file for the target network in the config directory.

Example for mainnet: 
```
{
    "CrucibleFactory": "0x54e0395CFB4f39beF66DBCd5bD93Cca4E9273D56",
    "startBlock": 11880064,
    "network": "mainnet"
}
```
### deploy-key auth

```yarn graph auth```


### Setup the subgraph.yaml

```yarn prepare mainnet``` 

### Deploy the subgraph

```yarn deploy mainnet```
