import { createFileRoute } from "@tanstack/react-router";
import handler from "../../../server/core/proposals.js";
import { runNodeHandler } from "@/lib/node-handler";

// Certified handler (../api/proposals.js, mirrored in server/core).
export const Route = createFileRoute("/api/proposals")({
  server: {
    handlers: {
      ANY: ({ request }) => runNodeHandler(handler, request),
    },
  },
});
