import { AnchorProvider } from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';

export function setupConnect(element: HTMLButtonElement) {
  element.innerHTML = `Connect`
  const connect = async () => {
    // @ts-ignore
    const getProvider = () => {
      if ("solana" in window) {
          const provider = window.solana as any;
          if (provider.isPhantom) {
              return provider;
          }
      }
      window.open("https://phantom.app/", "_blank");
  };
  
  const provider = getProvider();
  if (!provider) {
      console.error("Phantom wallet not found");
  } else {
      await provider.connect(); // Connect to the wallet
  }
  const wallet = {
      publicKey: provider.publicKey,
      signTransaction: provider.signTransaction.bind(provider),
      signAllTransactions: provider.signAllTransactions.bind(provider)
  };
  const network = "https://api.devnet.solana.com";
  const connection = new Connection(network, 'processed');
  const anchorProvider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });

    element.innerHTML = `Connected`
    document.querySelector<HTMLDivElement>('#account')!.innerHTML = `
      <p>Connected account: ${provider.publicKey.toBase58()}</p>
    `
  }
  element.addEventListener('click', () => connect())
}