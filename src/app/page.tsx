import { CardsSection } from "@/components/CardsSection";
import { ClearGlassButton, ClearGlassPanel } from "@/components/ClearGlass";
import { CloudField } from "@/components/CloudField";
import { LogoScene } from "@/components/LogoScene";

const BUTTONS = ["Tickets & tables", "See the lineup", "Watch the reel"];
const NAV = ["Events", "Venues", "Gallery", "Contact"];

export default function Home() {
  return (
    <>
      {/* cloud field is fixed, so it sits behind every section, not just the hero */}
      <div className="backdrop" data-html2canvas-ignore>
        <CloudField className="fill" />
      </div>

      <main className="stage">
        {/* a bloom behind the logo: the wordmark is near-black, so it needs
            something bright to sit against or it disappears into the sky */}
        <div className="layer layer--halo" aria-hidden />

        <LogoScene className="layer layer--logo" />

        {/* cloud drifting in front of the logo */}
        <div className="layer layer--veil" aria-hidden />

        <header className="chrome chrome--top">
          <ClearGlassPanel as="nav" className="clearglass--nav" strength={16} edge={14}>
            {NAV.map((item) => (
              <a className="navlink" href="#" key={item}>
                {item}
              </a>
            ))}
          </ClearGlassPanel>
        </header>

        <section className="chrome chrome--bottom">
          <p className="tagline">Club nights at Papi on the Beach &amp; PRIME &middot; Pordenone</p>
        </section>
      </main>

      {/* pmndrs/examples — cards-with-border-radius, pinned while you scroll it */}
      <CardsSection />

      <section className="outro">
        <h2>Two rooms. One lineup.</h2>
        <p>
          We run our nights at Papi on the Beach and at PRIME — nothing else,
          nowhere else. Reggaeton, dance and commerciale, resident nights like
          Maldita, Perreo, Project X and Trenches, doors from 11pm.
        </p>
        <ClearGlassButton>See what&rsquo;s on</ClearGlassButton>
      </section>

      {/* the glass stays put while the page moves behind it */}
      <div className="dock">
        <div className="actions">
          {BUTTONS.map((text) => (
            <ClearGlassButton key={text}>{text}</ClearGlassButton>
          ))}
        </div>
      </div>
    </>
  );
}
