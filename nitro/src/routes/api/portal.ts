import { createFileRoute } from "@tanstack/react-router";
import handler from "../../../server/core/portal.js";
import { runNodeHandler } from "@/lib/node-handler";

// Certified handler (../api/portal.js, mirrored in server/core). Non-POST methods get its 405 + Allow: POST.
export const Route = createFileRoute("/api/portal")({
  server: {
    handlers: {
      ANY: ({ request }) => runNodeHandler(handler, request),
    },
  },
});
