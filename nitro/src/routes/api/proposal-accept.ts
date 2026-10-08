import { createFileRoute } from "@tanstack/react-router";
import handler from "../../../server/core/proposal-accept.js";
import { runNodeHandler } from "@/lib/node-handler";

// Certified handler (../api/proposal-accept.js, mirrored in server/core).
export const Route = createFileRoute("/api/proposal-accept")({
  server: {
    handlers: {
      ANY: ({ request }) => runNodeHandler(handler, request),
    },
  },
});
