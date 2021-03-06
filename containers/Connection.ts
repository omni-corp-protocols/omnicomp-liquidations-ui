import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { API as OnboardApi, Wallet } from "bnc-onboard/dist/src/interfaces";
import Onboard from "bnc-onboard";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";

import { config } from "./Config";

type Provider = ethers.providers.Web3Provider;
type Block = ethers.providers.Block;
type Network = ethers.providers.Network;
type Signer = ethers.Signer;

function useConnection() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [onboard, setOnboard] = useState<OnboardApi | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [block$, setBlock$] = useState<Observable<Block> | null>(null);

  const attemptConnection = async () => {
    const onboardInstance = Onboard({
      dappId: config(network).onboardConfig.apiKey,
      hideBranding: true,
      networkId: 56, // Default. If on a different network will change with the subscription.
      darkMode: true,
      subscriptions: {
        address: (address: string | null) => {
          setUserAddress(address);
        },
        network: async (networkId: any) => {
          onboard?.config({ networkId: networkId });
        },
        wallet: async (wallet: Wallet) => {
          if (wallet.provider && wallet.name) {
            const ethersProvider = new ethers.providers.Web3Provider(
              wallet.provider
            );
            setProvider(ethersProvider);

            const _network = await ethersProvider.getNetwork();
            if (_network.chainId === 56 && _network.name === "unknown") {
              _network.name = "BSC";
            }
            setNetwork(_network);
            window.localStorage.setItem("selectedWallet", wallet.name);
          } else {
            setProvider(null);
            setNetwork(null);
            window.localStorage.removeItem("selectedWallet");
          }
        },
      },
      walletSelect: config(network).onboardConfig.onboardWalletSelect,
      walletCheck: config(network).onboardConfig.walletCheck,
    });

    const previouslySelectedWallet = window.localStorage.getItem(
      "selectedWallet"
    );
    if (previouslySelectedWallet != null) {
      await onboardInstance.walletSelect(previouslySelectedWallet);
    } else {
      await onboardInstance.walletSelect();
    }
    await onboardInstance.walletCheck();
    setOnboard(onboardInstance);
  };

  const connect = async () => {
    try {
      setError(null);
      await attemptConnection();
    } catch (error) {
      setError(error);
      alert(error.message);
    }
  };

  const disconnect = () => {
    if (onboard) {
      onboard.walletReset();
      window.localStorage.removeItem("selectedWallet");
      window.location.reload();
    }
  };

  // autoselect wallet on load
  useEffect(() => {
    const previouslySelectedWallet = window.localStorage.getItem(
      "selectedWallet"
    );
    if (previouslySelectedWallet != null) {
      connect();
    }
  }, []);

  // create observable to stream new blocks
  useEffect(() => {
    if (provider) {
      const observable = new Observable<Block>((subscriber) => {
        provider.on("block", (blockNumber: number) => {
          provider
            .getBlock(blockNumber)
            .then((block) => subscriber.next(block));
        });
      });
      // debounce to prevent subscribers making unnecessary calls
      const block$ = observable.pipe(debounceTime(1000));
      setBlock$(block$);
    }

    if (provider && userAddress) {
      setSigner(provider.getSigner());
    }
  }, [provider, userAddress]);

  return {
    provider,
    onboard,
    signer,
    network,
    userAddress,
    connect,
    disconnect,
    error,
    block$,
  };
}

const Connection = createContainer(useConnection);

export default Connection;
