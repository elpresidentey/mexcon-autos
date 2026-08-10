interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionHeader = ({ title, subtitle, action }: SectionHeaderProps) => (
  <div className="flex items-end justify-between gap-4 mb-8">
    <div>
      <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-wide uppercase text-dark-900">
        {title}
      </h2>
      {subtitle && <p className="text-sm text-metallic-600 mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);
