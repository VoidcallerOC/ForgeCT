import { Link } from "@tanstack/react-router";
import { Arrow } from "@/components/chrome";

export function NextSteps() {
  return (
    <section className="band band--tight band--void" aria-labelledby="next-title">
      <div className="wrap">
        <h2 id="next-title">Next steps</h2>
        <ul className="index">
          <li><Link to="/connecticut-web-design">Connecticut web design for local businesses <Arrow /></Link></li>
          <li><Link to="/services">See Forge CT services <Arrow /></Link></li>
          <li><Link to="/contact">Contact Forge CT <Arrow /></Link></li>
          <li><Link to="/book">Book a project conversation <Arrow /></Link></li>
        </ul>
      </div>
    </section>
  );
}
