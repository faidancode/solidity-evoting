import { network } from 'hardhat'

async function main() {
  const { viem } = await network.create()
  const voting = await viem.deployContract('Voting')

  console.log(`Voting deployed to: ${voting.address}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
