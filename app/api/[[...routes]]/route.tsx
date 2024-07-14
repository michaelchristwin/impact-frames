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

// Uncomment to use Edge Runtime
// export const runtime = 'edge'
let contractAdress: string;
app.frame("/frame", async (c) => {
  const { buttonValue, inputText, status } = c;
  const fruit = inputText || buttonValue;
  //console.log(fruit);
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
  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <img alt="nft" src={data.image} />
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
  return c.contract({
    abi: NFTABI,
    chainId: "eip155:11155111",
    functionName: "mintBatch",
    to: contractAdress as Address,
    args: [BigInt(inputText as string)],
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
