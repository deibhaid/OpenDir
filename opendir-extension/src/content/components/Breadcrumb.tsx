export function Breadcrumb() {
  let pathname = window.location.pathname;
  if (pathname.endsWith('/') && pathname.length > 1) {
    pathname = pathname.slice(0, -1);
  }
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground"
    >
      <a href={getHomeHref()} className="shrink-0 hover:text-foreground">
        Home
      </a>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const label = decodeURIComponent(segment);
        return (
          <span key={`${segment}-${index}`} className="inline-flex min-w-0 items-center gap-1.5">
            <span className="text-muted-foreground/50">&gt;</span>
            {isLast ? (
              <span className="truncate font-semibold text-foreground">{label}</span>
            ) : (
              <a href={getSegmentHref(segments, index)} className="truncate hover:text-foreground">
                {label}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function getHomeHref(): string {
  const url = new URL(window.location.href);
  url.pathname = '/';
  url.search = '';
  url.hash = '';
  return url.href;
}

function getSegmentHref(segments: string[], index: number): string {
  const url = new URL(window.location.href);
  const joined = `/${segments.slice(0, index + 1).join('/')}`;
  url.pathname = joined.endsWith('/') ? joined : `${joined}/`;
  url.search = '';
  url.hash = '';
  return url.href;
}
