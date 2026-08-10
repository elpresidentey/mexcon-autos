import { Link } from 'react-router-dom';
import { Button } from '../common';

interface PageCtaProps {
  titleLine1: string;
  titleLine2?: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export const PageCta = ({
  titleLine1,
  titleLine2,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: PageCtaProps) => (
  <section className="relative bg-primary-900 text-white py-14 lg:py-16 overflow-hidden">
    <div className="absolute inset-x-0 top-0 h-1 bg-accent-500" />
    <div className="container-custom relative">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-wide uppercase leading-tight">
          {titleLine1}
          {titleLine2 && <span className="block text-accent-400">{titleLine2}</span>}
        </h2>
        <p className="text-sm lg:text-base text-primary-100/90 mt-3 leading-relaxed">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 mt-7">
          <Link to={primaryHref}>
            <Button size="lg" className="bg-accent-500 text-black hover:bg-accent-400 font-semibold px-7 py-3 text-sm rounded-lg w-full sm:w-auto">
              {primaryLabel}
            </Button>
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link to={secondaryHref}>
              <Button
                size="lg"
                variant="outline"
                className="border border-white/70 bg-transparent text-white hover:bg-white hover:text-dark-900 font-semibold px-7 py-3 text-sm rounded-lg w-full sm:w-auto"
              >
                {secondaryLabel}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  </section>
);
