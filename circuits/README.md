# circuits

```
circom Sneak.circom --r1cs --wasm --sym --c
bun ./Sneak_js/generate_witness.js Sneak_js/Sneak.wasm input.json Sneak_js/witness.wtns
```

## Reference
- [Circom language tutorial with circomlib walkthrough](https://www.rareskills.io/post/circom-tutorial)
- [Converting Algebraic Circuits to R1CS (Rank One Constraint System)](https://www.rareskills.io/post/rank-1-constraint-system)
- https://github.com/RareSkills/zero-knowledge-puzzles
- https://github.com/vplasencia/zkSudoku
- https://github.com/vuvoth/ccls