import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Arrow, PageHead } from "@/components/chrome";
import { PhoneFrame } from "@/components/work";
import { caseStudyMeta, pageHead } from "@/lib/seo";
import { PROJECTS, projectBySlug } from "@/lib/work";
import { NextSteps } from "@/components/next-steps";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const project = projectBySlug(params.slug);
    if (!project) throw notFound();
    return { slug: project.slug };
  },
  head: ({ params }) => {
    const project = projectBySlug(params.slug);
    if (!project) return {};
    const meta = caseStudyMeta(project);
    return pageHead(`/work/${project.slug}`, project.robots ? { ...meta, robots: project.robots } : meta);
  },
  component: CaseStudy,
});

function CaseStudy() {
  const { slug } = Route.useLoaderData();
  const project = projectBySlug(slug)!;
  // In-progress engagements are not in the approved rotation; they lead back into it at the start.
  const index = PROJECTS.indexOf(project);
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const plate = ["Forge CT case study", ...(project.stage ? [project.stage] : []), project.category, project.place];
  return (
    <main id="main">
      <PageHead plate={plate} title={project.name}>
        <p className="lede">{project.built}</p>
      </PageHead>
      <section className="band">
        <div className="wrap case">
          <PhoneFrame project={project} eager />
          <div className="stack">
            <dl className="facts">
              <div>
                <dt>The problem</dt>
                <dd>{project.need}</dd>
              </div>
              <div>
                <dt>The Forge</dt>
                <dd>{project.built}</dd>
              </div>
              {project.designIntent ? (
                <div>
                  <dt>Design intent</dt>
                  <dd>{project.designIntent}</dd>
                </div>
              ) : null}
              {project.customerPath ? (
                <div>
                  <dt>What visitors can do</dt>
                  <dd>
                    <ul className="case-path">
                      {project.customerPath.map((step) => <li key={step}>{step}</li>)}
                    </ul>
                  </dd>
                </div>
              ) : null}
              {project.status ? (
                <div>
                  <dt>Where it stands</dt>
                  <dd>
                    <ul className="case-path">
                      {project.status.map((line) => <li key={line}>{line}</li>)}
                    </ul>
                    <p className="mono muted case-checked">Checked {project.statusCheckedOn}</p>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>Where</dt>
                <dd>
                  {project.place} · {project.category}
                </dd>
              </div>
              <div>
                <dt>Project notes</dt>
                <dd>
                  <ul className="tag-row">
                    {project.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>Project context</dt>
                <dd className="muted">
                  This is a feature-level account of the project. No conversion, revenue or other performance result is
                  claimed here.
                </dd>
              </div>
            </dl>
            {project.figure ? (
              <figure className="case-figure">
                <div className="phone-frame">
                  <img
                    src={project.figure.image}
                    alt={project.figure.alt}
                    width={720}
                    height={project.figure.imageHeight}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption className="muted">{project.figure.caption}</figcaption>
              </figure>
            ) : null}
            <div className="actions">
              {project.site ? (
                <a className="btn" href={project.site} target="_blank" rel="noopener noreferrer" data-track={`case_live_${project.slug}`}>
                  Visit {project.siteLabel} <Arrow dir="out" />
                </a>
              ) : null}
              <Link to="/work" className="btn btn--line">
                Back to all work
              </Link>
            </div>
            <Link to="/work/$slug" params={{ slug: next.slug }} className="next-case">
              <span>
                <span className="mono muted">Next case study</span>
                <br />
                <strong>{next.name}</strong>
              </span>
              <Arrow />
            </Link>
          </div>
        </div>
      </section>
      <NextSteps />
    </main>
  );
}
