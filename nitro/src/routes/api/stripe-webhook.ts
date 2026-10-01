import { createFileRoute } from "@tanstack/react-router";
import handler from "../../../server/core/stripe-webhook.js";
import { runNodeHandler } from "@/lib/node-handler";

// Certified handler (../api/stripe-webhook.js, mirrored in server/core). Non-POST methods get its 405 + Allow: POST.
export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      ANY: ({ request }) => runNodeHandler(handler, request, { rawBody: true }),
    },
  },
});
