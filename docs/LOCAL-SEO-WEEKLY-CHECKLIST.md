# Local SEO Weekly Checklist

## Completed in the site code

| Priority item | Status         | Implementation                                                                                                                                                                                                                                                     |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| On-page SEO   | Done           | Reworked the title tags and meta descriptions for the homepage, the Hartford web design landing page, and the services page around Farmington and Greater Hartford search intent. Open Graph titles and descriptions were aligned with the same positioning.       |
| Alt text      | Done           | Audited the portfolio images on the homepage. All five portfolio screenshots already have descriptive, project-specific alternative text; no image was left with an empty or generic `alt` value.                                                                  |
| Sitemap       | Done           | `sitemap.xml` exists, lists the canonical public routes, and is referenced from `robots.txt`.                                                                                                                                                                      |
| Phone number  | Blocked safely | No verified business phone number exists in the repository or on the public site. Do not publish a personal-data listing or an unverified number. Add the confirmed business number to the header, footer, contact section, and Organization schema once supplied. |

## Owner actions still required

### 1. Claim and optimize Google Business Profile

Use the verified business identity and the exact same NAP (name, address, phone) everywhere. Recommended profile setup:

- Business name: `FORGE CT`
- Primary category: choose the closest available web-design or website-development category in Google’s current category picker.
- Service area: Farmington and Greater Hartford, Connecticut, plus the actual towns served.
- Website: `https://www.forge-ct.com/`
- Description: explain that FORGE CT builds mobile-first websites for shops and local businesses in Farmington and Greater Hartford, with published starting prices and ongoing care plans.
- Add the confirmed business phone only after verification.
- Upload the FORGE CT mark, workspace/project photography, and approved portfolio images where Google permits them.
- Add the service list, hours, appointment URL if one exists, and a short weekly update.
- Request reviews from real clients after completed work; never create or incentivize reviews.

### 2. Submit to ten local/business directories

Submit manually after the NAP is finalized. Use the same business name, address/service area, phone, website, description, and category each time. Prioritize these ten sources, subject to current eligibility and availability:

1. Bing Places for Business
2. Apple Business Connect
3. Yelp for Business
4. Facebook Page / business location
5. LinkedIn Company Page
6. Better Business Bureau
7. Chamber of Commerce listing for the relevant local chamber
8. Connecticut business directory or state/local economic-development directory
9. Clutch
10. DesignRush

Record the listing URL, login owner, submitted NAP, verification state, and date in a private credential-safe tracker. Do not put passwords or verification codes in this repository.

### 3. Verify Search Console and submit the sitemap

1. Open Google Search Console and add the verified `https://www.forge-ct.com/` property.
2. Complete DNS, HTML-file, or HTML-tag verification using the method Google presents for the domain.
3. In **Sitemaps**, submit `https://www.forge-ct.com/sitemap.xml`.
4. Inspect the homepage and the `/hartford-web-design` URL, request indexing if needed, and check for canonical or mobile usability issues.
5. Recheck the sitemap after the next production deployment.

## NAP data needed before the remaining work can be completed

- Confirmed business phone number
- Public business address or service-area-only decision
- Confirmed Google Business Profile category
- Final business hours or appointment-only wording
- Preferred directory login owner

## Deployment note

The repository’s canonical URLs and sitemap use `https://www.forge-ct.com/`. Confirm that this domain is the production alias before requesting indexing. After deployment, verify `/robots.txt`, `/sitemap.xml`, the homepage, `/hartford-web-design`, and `/services` return HTTP 200 and expose the revised metadata.
