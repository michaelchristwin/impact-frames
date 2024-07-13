import { http, createConfig } from "wagmi";
import { sepolia, base } from "wagmi/chains";

export const config = createConfig({
  chains: [base, sepolia],
  transports: {
    [base.id]: http(),
    [sepolia.id]: http(),
  },
});
