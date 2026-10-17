import { figureVariants, isFigureVariant, type FigureVariant } from "./options";

const frameClassName: Record<FigureVariant, string> = {
  content: "my-8",
  wide: "my-10 ml-[50%] w-[min(48rem,calc(100vw-3rem))] max-w-none -translate-x-1/2",
  full: "my-10 ml-[calc(50%-50vw)] w-screen max-w-none",
};

export function Figure({
  src,
  alt,
  caption,
  variant = "content",
}: {
  src: string;
  alt: string;
  caption?: string;
  variant?: string;
}) {
  if (!src) throw new Error("Figure requires an image src.");
  if (!alt) throw new Error(`Figure (${src}) requires alt text.`);
  if (!isFigureVariant(variant)) {
    const expected = figureVariants.map((item) => item.value).join(", ");
    throw new Error(
      `Unknown Figure variant "${variant}". Expected one of: ${expected}.`,
    );
  }

  return (
    <figure className={`not-prose ${frameClassName[variant]}`}>
      {/* Case-study images don't have known dimensions at build time. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="block h-auto w-full" />
      {caption ? (
        <figcaption
          className={
            variant === "full" ? "mx-auto mt-2 max-w-prose px-6" : "mt-2"
          }
        >
          <span className="block text-sm leading-snug text-gray-500">
            {caption}
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}
