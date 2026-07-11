export function Footer() {
  return (
    <div className="mt-auto flex items-center justify-center w-full py-4">
      <ReleaseLink />
    </div>
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
