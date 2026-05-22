export const metadata = {
  title: "CV",
};

export default function CvPage() {
  return (
    <main className="mx-auto max-w-prose px-6 py-12 prose dark:prose-invert">
      <h1>Curriculum Vitae</h1>
      <p>
        Senior Fullstack Engineer with more than 10 years of professional
        experience building products for the web. Driven by building great
        products with a team of smart people &mdash; most experienced and
        useful as an engineer and technical manager.
      </p>

      <h2>Experience</h2>

      <h3>
        Gigs &mdash; <a href="https://gigs.com">gigs.com</a>
      </h3>
      <p>
        <strong>Engineering Manager</strong> &middot; 2024 &ndash; present
      </p>
      <ul>
        <li>
          Owned and continuously evolved the fullstack hiring pipeline
          (including take-home and live-coding formats), enabling ambitious
          hiring goals without lowering quality.
        </li>
        <li>
          Led a team of 5 through leadership transition and post-restructuring
          restaffing, rebuilding a high-performing team and maintaining
          delivery momentum.
        </li>
        <li>
          Expanded scope by taking over a second team in a key vertical while
          driving cross-team frontend reliability work (dependency upgrades,
          security fixes, platform health).
        </li>
        <li>
          Drove product and technical direction hands-on by steering major
          product/design changes, advancing AI adoption through practical
          tooling, and staying deep in architecture and implementation
          details.
        </li>
      </ul>

      <p>
        <strong>Senior Fullstack Engineer</strong> &middot; 2022 &ndash; 2024
      </p>
      <ul>
        <li>
          Worked on Connect, a user-facing, multi-tenant, no-code platform
          allowing customers to sell connectivity products without
          implementation effort.
        </li>
        <li>
          Refactored the number porting flow and moved it from pre-checkout to
          post-checkout, vastly decreasing user churn.
        </li>
        <li>
          Authored the initial release of in-house API documentation, retiring
          a generic, bought-in solution.
        </li>
        <li>
          Wrote guides and recorded instructional videos to aid customers
          implementing Connect features.
        </li>
        <li>
          Worked on the conversion of Next.js app from the pages to the app
          router.
        </li>
      </ul>

      <h3>
        Cisco &mdash; <a href="https://cisco.com">cisco.com</a>
      </h3>
      <p>
        <strong>Software Engineer</strong> &middot; 2020 &ndash; 2022
      </p>
      <ul>
        <li>
          Created <a href="https://webex.shop">Webex Shop</a> with a small
          team, bringing it to production within 3 months.
        </li>
        <li>Introduced Hotwire to the existing Rails codebase.</li>
        <li>
          Worked closely with designers and product managers to improve the
          existing device shop.
        </li>
      </ul>

      <h3>
        Railslove &mdash; <a href="https://railslove.com">railslove.com</a>
      </h3>
      <p>
        <strong>Fullstack Engineer</strong> &middot; 2016 &ndash; 2020
      </p>
      <ul>
        <li>
          Worked on the design and implementation of multiple customer
          projects, with Ruby on Rails and React.js.
        </li>
        <li>Led and managed customer projects.</li>
      </ul>

      <h3>51seven</h3>
      <p>
        <strong>Co-Founder &amp; Design Engineer</strong> &middot; 2014 &ndash;
        2016
      </p>
      <ul>
        <li>
          Co-founded 51seven, a small agency focused on building web
          applications for small and medium-sized businesses.
        </li>
        <li>Actively involved in the daily operations of the agency.</li>
      </ul>

      <h3>Technical University of Cologne</h3>
      <p>
        <strong>Scientific Assistant &amp; Tutor</strong> &middot; 2013 &ndash;
        2016
      </p>
      <ul>
        <li>Worked as a scientific assistant helping build courses.</li>
        <li>Ran workshops on tools like Sketch, Photoshop, and Git.</li>
      </ul>

      <h2>Education</h2>
      <h3>Technical University of Cologne</h3>
      <p>2012 &ndash; 2016 &middot; B.Sc. Web Science</p>
    </main>
  );
}
