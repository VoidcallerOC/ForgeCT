import { clientIp, isRateLimited } from "./_ratelimit.js";
import { contentTypeIsJson, readJsonBody } from "./_proposal-auth.js";
import { automaticTax, siteUrl, stripe } from "./_stripe.js";
import { canStartCheckout } from "./_proposal-state.js";
import { getProposal, transitionProposal } from "./_proposal-store.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response
      .status(405)
      .json({ ok: false, error: "Method not allowed." });
  }
  if (!contentTypeIsJson(request)) {
    return response
      .status(415)
      .json({ ok: false, error: "JSON body required." });
  }

  try {
    if (await isRateLimited("proposal_checkout", clientIp(request), 10)) {
      response.setHeader("Retry-After", "900");
      return response.status(429).json({
        ok: false,
        error:
          "Too many checkout attempts. Wait a bit, or email create@forge-ct.com.",
      });
    }
  } catch (error) {
    console.error("proposal checkout rate limiter failed", error);
    return response.status(503).json({
      ok: false,
      error: "Checkout is temporarily unavailable. Please try again shortly.",
    });
  }

  let body;
  try {
    body = readJsonBody(request, 8 * 1024);
  } catch (error) {
    return response.status(error.status || 400).json({
      ok: false,
      error: error.message,
    });
  }

  const publicId = String(body.public_id || body.id || "").trim();
  if (!publicId) {
    return response
      .status(400)
      .json({ ok: false, error: "Proposal id is required." });
  }

  const client = stripe();
  if (!client) {
    return response.status(503).json({
      ok: false,
      error: "Stripe is not configured.",
    });
  }

  try {
    const proposal = await getProposal(publicId);
    if (
      !proposal ||
      proposal.status === "DRAFT" ||
      proposal.status === "ARCHIVED"
    ) {
      return response
        .status(404)
        .json({ ok: false, error: "Proposal not found." });
    }
    if (!canStartCheckout(proposal.status)) {
      return response.status(409).json({
        ok: false,
        error: `Checkout is not available in status ${proposal.status}. Accept the proposal first.`,
      });
    }

    const depositCents = Number(proposal.deposit_cents);
    if (!Number.isInteger(depositCents) || depositCents <= 0) {
      return response.status(409).json({
        ok: false,
        error: "This proposal has no deposit amount configured.",
      });
    }

    const origin = siteUrl(request);
    const session = await client.checkout.sessions.create({
      mode: "payment",
      customer_email: proposal.contact_email,
      success_url: `${origin}/proposals/${proposal.public_id}?paid=1`,
      cancel_url: `${origin}/proposals/${proposal.public_id}?paid=0`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: proposal.currency || "usd",
            unit_amount: depositCents,
            product_data: {
              name: `FORGE CT deposit — ${proposal.project_title}`,
              description: `Proposal ${proposal.public_id} v${proposal.version} · ${proposal.business_name}`,
              metadata: {
                proposal_public_id: proposal.public_id,
                proposal_version: String(proposal.version),
              },
            },
          },
        },
      ],
      metadata: {
        source: "forge_proposal_deposit",
        proposal_public_id: proposal.public_id,
        proposal_version: String(proposal.version),
        deposit_cents: String(depositCents),
      },
      automatic_tax: automaticTax(),
    });

    const pending = await transitionProposal(publicId, {
      toStatus: "PAYMENT_PENDING",
      eventType: "checkout_created",
      actor: "client",
      stripeCheckoutSessionId: session.id,
      detail: {
        checkout_session_id: session.id,
        deposit_cents: depositCents,
      },
    });

    return response.status(200).json({
      ok: true,
      checkout_url: session.url,
      session_id: session.id,
      proposal: {
        public_id: pending.public_id,
        status: pending.status,
        deposit_cents: pending.deposit_cents,
      },
    });
  } catch (error) {
    const status =
      error.status || (error.code === "INVALID_TRANSITION" ? 409 : 500);
    if (status >= 500) console.error("proposal-checkout error", error);
    return response.status(status).json({
      ok: false,
      error: error.message || "Checkout failed.",
      code: error.code || undefined,
    });
  }
}
