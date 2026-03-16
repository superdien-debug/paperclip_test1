import { createDb } from "./packages/db/dist/client.js";
import { agents } from "./packages/db/dist/schema/index.js";
import { eq } from "drizzle-orm";
import "dotenv/config";

const url = process.env.DATABASE_URL;
const db = createDb(url);

const AGENT_ID = "a45eef32-a325-41d8-bdbb-0a9d394309e2";
const CORRECT_CWD = "/Users/phoi/Desktop/paperclip_test1";
const CORRECT_INSTRUCTIONS = "/Users/phoi/Desktop/paperclip_test1/Structure"; // Note: Structure is capitalized in the file system

async function run() {
  const [agent] = await db.select().from(agents).where(eq(agents.id, AGENT_ID));
  if (!agent) {
    console.error("Agent not found");
    return;
  }

  const newConfig = {
    ...agent.adapterConfig,
    cwd: CORRECT_CWD,
    instructionsFilePath: CORRECT_INSTRUCTIONS
  };

  await db.update(agents)
    .set({ config: newConfig })
    .where(eq(agents.id, AGENT_ID));

  console.log("Agent updated successfully");
}

run().catch(console.error);
