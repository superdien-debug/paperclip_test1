import { createDb } from "./packages/db/dist/client.js";
import { agents, projects } from "./packages/db/dist/schema/index.js";
import { eq } from "drizzle-orm";
import "dotenv/config";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const db = createDb(url);

async function run() {
  console.log("Checking Agents...");
  const agentRows = await db.select().from(agents);
  for (const agent of agentRows) {
    console.log(`Agent: ${agent.name} (${agent.id})`);
    console.log(`Config: ${JSON.stringify(agent.config, null, 2)}`);
  }

  console.log("\nChecking Projects...");
  const projectRows = await db.select().from(projects);
  for (const project of projectRows) {
    console.log(`Project: ${project.name} (${project.id})`);
    console.log(`Local CWD: ${project.localCwd}`);
  }
}

run().catch(console.error);
