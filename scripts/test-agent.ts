// scripts/test-agent.ts
import { handleUserQuery } from "@/lib/claude-agent";

async function main() {
  const reply = await handleUserQuery(
    "How many open tasks are in api redesign project?",
  );
  console.log("Odgovor:", reply);
}

main();
