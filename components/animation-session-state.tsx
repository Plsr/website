// Applies per-session animation state before first paint, following the
// inline-script pattern from the official Next.js guide on preventing flash
// before hydration:
// https://nextjs.org/docs/app/guides/preventing-flash-before-hydration
// (demo: https://github.com/vercel-labs/preventing-flash-before-hydration)
//
// The script must run synchronously during HTML parsing — before React
// hydrates — because sessionStorage is only readable in the browser and the
// server-rendered HTML paints first. It sets classes on <html> that the CSS
// in globals.css and the animation components hand off from:
//
// - `reveal-pending`: hides the featured-writing cards until RevealOnScroll
//   takes over (only when their entrance animation hasn't played this tab).
// - `headline-done`: statically completes the headline typewriter when it
//   has already played this tab.
//
// `type="text/plain"` on the client stops React from warning about script
// tags rendered during client navigations, where the script must not (and
// cannot) execute — the useLayoutEffects in the animation components cover
// that case.
const script = `try{if(!sessionStorage.getItem("featured-writing-revealed"))document.documentElement.classList.add("reveal-pending");if(sessionStorage.getItem("headline-typed"))document.documentElement.classList.add("headline-done")}catch(e){}`;

export function AnimationSessionState() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
