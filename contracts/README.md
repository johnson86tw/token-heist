# @token-heist/contracts

```
cd contracts

pnpm hardhat node
pnpm hardhat run scripts/deploy.ts --network localhost
pnpm hardhat run scripts/verifyProof.ts --network localhost

pnpm hardhat run scripts/deploy.ts --network arbitrum-sepolia
pnpm hardhat run scripts/verifyProof.ts --network arbitrum-sepolia
```

## Develop
- sepolia explorer https://sepolia.etherscan.io/
- eth-converter https://eth-converter.com/


## Reference
- https://github.com/vimwitch/poseidon-solidity
- [[筆記] 用ethers.ContractFactory連接libraries](https://medium.com/@vivi43222/%E7%AD%86%E8%A8%98-%E7%94%A8ethers-contractfactory%E9%80%A3%E6%8E%A5libraries-8de6e6f5111f)
- [How to broadcast signed transaction with ethers.js?](https://ethereum.stackexchange.com/questions/110959/how-to-broadcast-signed-transaction-with-ethers-js)