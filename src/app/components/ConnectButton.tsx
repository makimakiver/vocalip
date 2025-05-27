'use client';
import { useConnectModal } from '@tomo-inc/tomo-evm-kit';

const ConnectButton = () => {
  const { openConnectModal } = useConnectModal();

  return (
    <button onClick={openConnectModal}>
      Connect Wallet
    </button>
  );
};

export default ConnectButton;