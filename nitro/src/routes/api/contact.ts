import { createFileRoute } from "@tanstack/react-router";
import handler from "../../../server/core/contact.js";
import { runNodeHandler } from "@/lib/node-handler";

// Certified handler (../api/contact.js, mirrored in server/core). Non-POST methods get its 405 + Allow: POST.
export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      ANY: ({ request }) => runNodeHandler(handler, request),
    },
  },
});
