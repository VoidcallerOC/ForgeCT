import { Plate } from "@/components/chrome";

type ClientNote = {
  quote: string;
  name: string;
  business: string;
};

// Intentionally empty: the repository contains no FORGE CT client testimonials with publication permission.
// Add only exact, approved client wording and attribution; never seed this list with sample or placeholder quotes.
// Owner process: nitro/docs/client-testimonial-checklist.md
const CLIENT_NOTES: readonly ClientNote[] = [];

export function ClientNotes() {
  if (CLIENT_NOTES.length === 0) return null;

  return (
    <section className="band client-notes" aria-labelledby="client-notes-title">
      <div className="wrap">
        <Plate items={["Client voice", "Published with permission"]} />
        <h2 id="client-notes-title">What it was like to build together.</h2>
        <ul className="client-notes-list">
          {CLIENT_NOTES.slice(0, 3).map((note) => (
            <li key={`${note.name}-${note.business}`}>
              <figure>
                <blockquote>{note.quote}</blockquote>
                <figcaption>
                  <strong>{note.name}</strong>
                  <span>{note.business}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
