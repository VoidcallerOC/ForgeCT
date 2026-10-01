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
    return project ? pageHead(`/work/${project.slug}`, caseStudyMeta(project)) : {};
  },
  component: CaseStudy,
});

function CaseStudy() {
  const { slug } = Route.useLoaderData();
  const project = projectBySlug(slug)!;
  const index = PROJECTS.indexOf(project);
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  return (
    <main id="main">
      <PageHead plate={["Forge CT case study", project.category, project.place]} title={project.name}>
        <p className="lede">{project.built}</p>
      </PageHead>
      <section className="band">
        <div className="wrap case">
          <PhoneFrame project={project} eager />
          <div className="stack">
            <dl className="facts">
              <div>
                <dt>The need</dt>
                <dd>{project.need}</dd>
              </div>
              <div>
                <dt>What Forge CT built</dt>
                <dd>{project.built}</dd>
              </div>
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
                  This case study records the project information currently documented in the Forge CT portfolio. It
                  does not add performance claims or outcomes that are not documented.
                </dd>
              </div>
            </dl>
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
