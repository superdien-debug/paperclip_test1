import { createDb } from "./packages/db/dist/client.js";
import { issues } from "./packages/db/dist/schema/index.js";
import { eq } from "drizzle-orm";
import "dotenv/config";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const db = createDb(url);

async function run() {
  const taskId = "a7ac6045-84ec-44e1-896f-68855bcb97e7";
  console.log(`Querying task: ${taskId}`);
  const [task] = await db.select().from(issues).where(eq(issues.id, taskId));
  if (task) {
    console.log("Task found:");
    console.log(JSON.stringify(task, null, 2));
  } else {
    console.log("Task not found");
  }
}

run().catch(console.error);
