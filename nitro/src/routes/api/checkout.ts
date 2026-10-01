import { createFileRoute } from "@tanstack/react-router";
import handler from "../../../server/core/checkout.js";
import { runNodeHandler } from "@/lib/node-handler";

// Certified handler (../api/checkout.js, mirrored in server/core). Non-POST methods get its 405 + Allow: POST.
export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      ANY: ({ request }) => runNodeHandler(handler, request),
    },
  },
});
