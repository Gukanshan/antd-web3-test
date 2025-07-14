import {
  http,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt
} from 'wagmi'
import {
  Address,
  ConnectButton,
  Connector,
  NFTCard,
  useAccount
} from '@ant-design/web3'
import {
  Mainnet,
  MetaMask,
  Sepolia,
  WagmiWeb3ConfigProvider
} from '@ant-design/web3-wagmi'
import { Button, message } from 'antd'
import { parseEther } from 'viem'
import { useEffect, useState } from 'react'

const CONTRACT_ADDRESS = '0xEcd0D12E21805803f70de03B72B1C162dB0898d9'

const CallTest = () => {
  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })
  const { account } = useAccount()
  const result = useReadContract({
    abi: [
      {
        type: 'function',
        name: 'balanceOf',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ type: 'uint256' }]
      }
    ],
    address: CONTRACT_ADDRESS,
    functionName: 'balanceOf',
    args: [account?.address as `0x${string}`]
  })

  useEffect(() => {
    if (isConfirmed) {
      message.success('Mint confirmed!')
      result.refetch()
    }
  }, [isConfirmed])

  return (
    <div>
      <h2>Balance of {account?.address}</h2>
      <p>{result.data?.toString() || 'Loading...'}</p>
      <Button
        loading={isConfirming}
        onClick={() => {
          writeContract(
            {
              abi: [
                {
                  type: 'function',
                  name: 'mint',
                  stateMutability: 'payable',
                  inputs: [
                    {
                      internalType: 'unit256',
                      name: 'quantity',
                      type: 'uint256'
                    }
                  ],
                  outputs: []
                }
              ],
              address: CONTRACT_ADDRESS,
              functionName: 'mint',
              args: [BigInt(1)],
              value: parseEther('0.01')
            },
            {
              onSuccess: () => {
                message.success('Transaction sent successfully!')
              },
              onError: (error) => {
                message.error(`Transaction failed: ${error.message}`)
              }
            }
          )
        }}
      >
        mint NFT
      </Button>
    </div>
  )
}

export default function Web3() {
  return (
    <WagmiWeb3ConfigProvider
      eip6963={{
        autoAddInjectedWallets: true
      }}
      transports={{
        [Mainnet.id]: http(
          'https://api.zan.top/node/v1/eth/mainnet/2357f4c3649d4baeae78b73b28d64922'
        )
      }}
      chains={[Mainnet, Sepolia]}
      wallets={[MetaMask()]}
    >
      <div
        style={{
          height: '100vh',
          padding: '20px'
        }}
      >
        <h1>Antd Web3</h1>
        <Address format address="0xEcd0D12E21805803f70de03B72B1C162dB0898d9" />
        <NFTCard
          title="Test My NFT"
          description="This is a description of NFT."
          address="0xEcd0D12E21805803f70de03B72B1C162dB0898d9"
          tokenId="641"
          image="https://example.com/nft-image.png"
        />
        <Connector>
          <ConnectButton />
        </Connector>
        <CallTest />
      </div>
    </WagmiWeb3ConfigProvider>
  )
}
