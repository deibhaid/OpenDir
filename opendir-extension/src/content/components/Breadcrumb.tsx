import { ChevronRight, Home } from 'lucide-react';
import { useOpenDir } from '../context/OpenDirContext';

export function Breadcrumb() {
  const pathname = window.location.pathname;
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
      <a
        href="/"
        className="inline-flex shrink-0 items-center gap-1 hover:text-foreground"
        title="Home"
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </a>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = `/${segments.slice(0, index + 1).join('/')}${isLast ? '' : '/'}`;
        return (
          <span key={`${segment}-${index}`} className="inline-flex min-w-0 items-center gap-1">
            <ChevronRight className="h-4 w-4 shrink-0" />
            {isLast ? (
              <span className="truncate font-medium text-foreground">{decodeURIComponent(segment)}</span>
            ) : (
              <a href={href} className="truncate hover:text-foreground">
                {decodeURIComponent(segment)}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}
