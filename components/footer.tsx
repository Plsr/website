import Image from "next/image";
import footerBgDark from "@/public/footer-bg.png";
import footerBgLight from "@/public/footer-bg-light.png";

export function Footer() {
  return (
    <footer className="mt-auto flex flex-col items-center w-full">
      <div className="flex items-center justify-center w-full py-4">
        <ReleaseLink />
      </div>
      <div className="relative w-full">
        <Image
          src={footerBgLight}
          alt=""
          placeholder="blur"
          sizes="100vw"
          className="w-full h-auto dark:hidden"
        />
        <Image
          src={footerBgDark}
          alt=""
          placeholder="blur"
          sizes="100vw"
          className="w-full h-auto hidden dark:block"
        />
        <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-background to-transparent" />
      </div>
    </footer>
  );
}

function ReleaseLink({
  buildVersion = process.env.BUILD_VERSION,
}: {
  buildVersion?: string;
}) {
  if (!buildVersion) {
    return <small className="opacity-40">dev build</small>;
  }

  return (
    <small className="opacity-40">
      <a href={`https://github.com/Plsr/website/commit/${buildVersion}`}>
        Release: {buildVersion.slice(0, 7)}
      </a>
    </small>
  );
}
