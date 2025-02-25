/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";

import { devtools } from "frog/dev";
import NFTABI from "@/ABI/Proxycontract.json";
import { readContract } from "@wagmi/core";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { config } from "@/config/wagmiConfig";
import { sepolia } from "viem/chains";
import { Address } from "viem";

const app = new Frog({
  title: "Impact Frames",
  assetsPath: "/",
  basePath: "/api",

  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});
// test id = 0xe3B26f198D53516E3cbbF5B6919153834DEbC924
// Uncomment to use Edge Runtime
// export const runtime = 'edge'
const frontendURL = process.env.NEXT_PUBLIC_FRONTEND as string;

let contractAdress: string;
let unitPrice: bigint;
app.frame("/frame", async (c) => {
  const { status } = c;
  const query = c.req.query();
  contractAdress = query.id;
  console.log(query.id);
  const result = await readContract(config, {
    abi: NFTABI,
    chainId: sepolia.id,
    address: contractAdress as Address,
    args: [BigInt(0)],
    functionName: "tokenURI",
  });
  const data = await (await fetch(result as string)).json();
  console.log(data);
  const price = await readContract(config, {
    abi: NFTABI,
    chainId: sepolia.id,
    address: contractAdress as Address,
    functionName: "_unitPrice",
  });
  console.log(price);
  unitPrice = price as bigint;
  return c.res({
    browserLocation: `${frontendURL}/dashboard/collection/mint/${contractAdress}`,
    image: (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
        }}
      >
        <img alt="nft" src={data.image} style={{ borderRadius: "17px" }} />
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter quantity..." />,
      <Button.Transaction target="/buy">Buy</Button.Transaction>,
      status === "response" && <Button.Reset>Reset</Button.Reset>,
    ],
  });
});

app.transaction("/buy", (c) => {
  const { inputText } = c;
  console.log(inputText);
  return c.contract({
    abi: NFTABI,
    chainId: "eip155:11155111",
    value: BigInt(BigInt(inputText || 1) * unitPrice),
    functionName: "mintBatch",
    to: contractAdress as Address,
    args: [BigInt(inputText || 1)],
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
