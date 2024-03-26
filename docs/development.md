# Development

## Considerations for monorepo development
- When contracts are updated, remember to run the build to generate new typechain types. Then, in the frontend, execute `pnpm typecheck` to inspect where updates are needed.
- When contracts are updated, remember to restart the backend so that the frontend can deploy the latest contracts.
- When the circuit is updated, remember to run the build. It will copy important files to `/contracts/contracts` and `/app/public`.