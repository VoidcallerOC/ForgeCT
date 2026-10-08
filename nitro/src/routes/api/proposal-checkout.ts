import { createFileRoute } from "@tanstack/react-router";
import handler from "../../../server/core/proposal-checkout.js";
import { runNodeHandler } from "@/lib/node-handler";

// Certified handler (../api/proposal-checkout.js, mirrored in server/core).
export const Route = createFileRoute("/api/proposal-checkout")({
  server: {
    handlers: {
      ANY: ({ request }) => runNodeHandler(handler, request),
    },
  },
});
