import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
  onDark?: boolean;
}

export const Breadcrumbs = ({ items, showHome = true, className = '', onDark = false }: BreadcrumbsProps) => {
  if (!items || items.length === 0) return null;

  const inactiveLink = onDark ? 'text-metallic-300 hover:text-accent-400' : 'text-metallic-500 hover:text-primary-600';
  const mutedIcon = onDark ? 'text-metallic-400' : 'text-metallic-400';
  const lastCrumb = onDark ? 'text-white font-bold' : 'text-dark-900 font-semibold';

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center space-x-2 text-sm">
        {showHome && (
          <>
            <li>
              <Link
                to="/"
                className={`${inactiveLink} transition-colors`}
                aria-label="Home"
              >
                <HomeIcon className="h-5 w-5" />
              </Link>
            </li>
            {items.length > 0 && (
              <li>
                <ChevronRightIcon className={`h-4 w-4 ${mutedIcon}`} aria-hidden="true" />
              </li>
            )}
          </>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center space-x-2">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className={`${inactiveLink} transition-colors font-medium`}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`${isLast ? lastCrumb : inactiveLink}`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRightIcon className={`h-4 w-4 ${mutedIcon}`} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
