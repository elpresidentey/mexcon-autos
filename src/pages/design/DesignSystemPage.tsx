import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Divider,
  EmptyState,
  FormField,
  Input,
  LoadingSpinner,
  Modal,
  Pagination,
  Radio,
  SearchBar,
  Select,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Switch,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Textarea,
  Tooltip,
  ToastViewport,
  toast,
} from '@/components/common';
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const brandSwatches: Array<{ name: string; colors: Array<{ label: string; className: string }> }> = [
  {
    name: 'primary',
    colors: [
      { label: '50', className: 'bg-primary-50' },
      { label: '100', className: 'bg-primary-100' },
      { label: '200', className: 'bg-primary-200' },
      { label: '300', className: 'bg-primary-300' },
      { label: '400', className: 'bg-primary-400' },
      { label: '500', className: 'bg-primary-500' },
      { label: '600', className: 'bg-primary-600' },
      { label: '700', className: 'bg-primary-700' },
      { label: '800', className: 'bg-primary-800' },
      { label: '900', className: 'bg-primary-900' },
      { label: '950', className: 'bg-primary-950' },
    ],
  },
  {
    name: 'accent',
    colors: [
      { label: '50', className: 'bg-accent-50' },
      { label: '100', className: 'bg-accent-100' },
      { label: '200', className: 'bg-accent-200' },
      { label: '300', className: 'bg-accent-300' },
      { label: '400', className: 'bg-accent-400' },
      { label: '500', className: 'bg-accent-500' },
      { label: '600', className: 'bg-accent-600' },
      { label: '700', className: 'bg-accent-700' },
      { label: '800', className: 'bg-accent-800' },
      { label: '900', className: 'bg-accent-900' },
    ],
  },
  {
    name: 'metallic',
    colors: [
      { label: '50', className: 'bg-metallic-50' },
      { label: '100', className: 'bg-metallic-100' },
      { label: '200', className: 'bg-metallic-200' },
      { label: '300', className: 'bg-metallic-300' },
      { label: '400', className: 'bg-metallic-400' },
      { label: '500', className: 'bg-metallic-500' },
      { label: '600', className: 'bg-metallic-600' },
      { label: '700', className: 'bg-metallic-700' },
      { label: '800', className: 'bg-metallic-800' },
      { label: '900', className: 'bg-metallic-900' },
    ],
  },
];

const semanticSwatches = [
  { label: 'surface', className: 'bg-surface', ring: true },
  { label: 'surface-muted', className: 'bg-surface-muted' },
  { label: 'ink', className: 'bg-ink' },
  { label: 'ink-muted', className: 'bg-ink-muted' },
  { label: 'ink-subtle', className: 'bg-ink-subtle' },
  { label: 'line', className: 'bg-line' },
  { label: 'line-strong', className: 'bg-line-strong' },
];

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const Section = ({ title, description, children }: SectionProps) => (
  <section className="bg-surface rounded-card shadow-card">
    <div className="px-6 py-5 border-b border-line">
      <h2 className="text-lg font-bold text-ink tracking-tight">{title}</h2>
      {description && <p className="mt-1 text-sm text-ink-subtle">{description}</p>}
    </div>
    <div className="px-6 py-6">{children}</div>
  </section>
);

export const DesignSystemPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [alertVisible, setAlertVisible] = useState(true);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [acceptsTerms, setAcceptsTerms] = useState(true);
  const [stockFilter, setStockFilter] = useState('in-stock');

  return (
    <div className="min-h-screen bg-surface-muted">
      <ToastViewport />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-900 text-white">
        <div className="container-custom flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl tracking-wide">MEXCON</span>
            <span className="text-xs uppercase tracking-widest text-primary-400 font-semibold hidden sm:inline">
              Design System
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <a href="/" className="text-metallic-300 hover:text-white transition-colors">
              Back to shop
            </a>
            <a
              href="#colors"
              className="hidden md:inline text-metallic-300 hover:text-white transition-colors"
            >
              Colors
            </a>
            <a
              href="#components"
              className="hidden md:inline text-metallic-300 hover:text-white transition-colors"
            >
              Components
            </a>
          </nav>
        </div>
      </header>

      <main className="container-custom py-10 space-y-8">
        {/* Intro */}
        <div className="pt-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
            Mexcon Autos
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight text-ink mt-2">
            Design System
          </h1>
          <p className="mt-3 max-w-2xl text-ink-muted">
            Every reusable component and design token in one place. Import anything from{' '}
            <code className="px-1.5 py-0.5 rounded bg-surface-muted border border-line text-sm text-primary-700">
              @/components/common
            </code>{' '}
            — see <span className="font-semibold text-ink">DESIGN-SYSTEM.md</span> for the full
            reference.
          </p>
        </div>

        {/* Colors */}
        <div id="colors" className="space-y-4">
          <h2 className="text-2xl font-bold text-ink tracking-tight">Color Tokens</h2>
          {brandSwatches.map((family) => (
            <div key={family.name}>
              <p className="text-sm font-semibold text-ink-muted mb-2">{family.name}</p>
              <div className="grid grid-cols-5 sm:grid-cols-11 gap-2">
                {family.colors.map((swatch) => (
                  <div key={swatch.label} className="text-center">
                    <div
                      className={`h-12 rounded-lg border border-line ${swatch.className}`}
                      title={swatch.className}
                    />
                    <p className="mt-1 text-xs text-ink-subtle">{swatch.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div>
            <p className="text-sm font-semibold text-ink-muted mb-2">semantic</p>
            <div className="flex flex-wrap gap-3">
              {semanticSwatches.map((swatch) => (
                <div key={swatch.label} className="flex items-center gap-2">
                  <div
                    className={`h-9 w-9 rounded-lg border ${swatch.className} ${
                      swatch.ring ? 'border-line' : ''
                    }`}
                  />
                  <span className="text-xs text-ink-subtle">{swatch.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Typography */}
        <Section title="Typography" description="DM Sans for UI, Barlow Condensed for display headlines.">
          <div className="space-y-4">
            <p className="font-display text-4xl font-bold uppercase tracking-tight">
              Display — Barlow Condensed
            </p>
            <p className="text-3xl font-bold tracking-tight">Heading 1 — DM Sans Bold</p>
            <p className="text-2xl font-semibold tracking-tight">Heading 2 — DM Sans Semibold</p>
            <p className="text-lg font-semibold">Heading 3 — DM Sans Semibold</p>
            <p className="text-base">
              Body — regular DM Sans at 16px with comfortable line height for product descriptions.
            </p>
            <p className="text-sm text-ink-subtle">Muted body — text-sm, ink-subtle</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
              Label — tiny uppercase
            </p>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Button" description="Variants, sizes, loading, and icons.">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button className="btn-accent">Accent</Button>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button isLoading>Loading</Button>
              <Button rightIcon={<ArrowRightIcon className="h-4 w-4" />}>With icon</Button>
              <Button as="a" href="#components">
                As link
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badge" description="Status and emphasis markers.">
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
          </div>
        </Section>

        {/* Alerts */}
        <Section title="Alert" description="Inline feedback, closable when needed.">
          <div className="space-y-3">
            <Alert severity="info" message="We updated our delivery windows for the holidays." />
            <Alert severity="success" message="Your enquiry was submitted successfully." />
            <Alert severity="warning" message="Stock is low on this item — order soon." />
            <Alert severity="error" message="Payment failed. Please try another method." />
            {alertVisible && (
              <Alert
                severity="info"
                message="This alert can be dismissed."
                closable
                onClose={() => setAlertVisible(false)}
              />
            )}
            {!alertVisible && (
              <Button size="sm" onClick={() => setAlertVisible(true)}>
                Show closable alert
              </Button>
            )}
          </div>
        </Section>

        {/* Form controls */}
        <Section
          title="Form Controls"
          description="Input, Textarea, Select, Radio, Checkbox, Switch, and FormField."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Product name" placeholder="Brake pad set" helperText="Visible in the catalogue." />
            <Input
              label="OEM number"
              placeholder="48510-0K140"
              error="An item with this OEM number already exists."
            />
            <Textarea label="Description" placeholder="Describe the part..." helperText="Markdown supported." />
            <Select
              label="Condition"
              defaultValue="genuine"
              options={[
                { value: 'genuine', label: 'Genuine' },
                { value: 'oem_equivalent', label: 'OEM Equivalent' },
                { value: 'aftermarket', label: 'Aftermarket' },
                { value: 'rebuilt', label: 'Rebuilt' },
                { value: 'used', label: 'Used' },
              ]}
            />
            <div className="space-y-3">
              <p className="text-sm font-semibold text-ink-muted">Stock filter</p>
              <Radio
                id="ds-radio-all"
                name="stock-filter"
                label="All items"
                checked={stockFilter === 'all'}
                onChange={() => setStockFilter('all')}
              />
              <Radio
                id="ds-radio-instock"
                name="stock-filter"
                label="In stock only"
                checked={stockFilter === 'in-stock'}
                onChange={() => setStockFilter('in-stock')}
              />
              <Checkbox
                id="ds-terms"
                label="Send me stock alerts"
                checked={acceptsTerms}
                onChange={() => setAcceptsTerms(!acceptsTerms)}
              />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-ink-muted">Notifications</p>
              <div className="flex items-center gap-3">
                <Switch checked={notificationsOn} onCheckedChange={setNotificationsOn} label="Enable notifications" />
                <span className="text-sm text-ink-muted">
                  {notificationsOn ? 'On' : 'Off'}
                </span>
              </div>
              <FormField label="Warranty (months)" required hint="How long the part is covered.">
                <Input id="ds-warranty" type="number" defaultValue={6} />
              </FormField>
              <FormField label="Engine code" error="Required when condition is Rebuilt.">
                <Input id="ds-engine" defaultValue="LF" />
              </FormField>
            </div>
          </div>
        </Section>

        {/* Card */}
        <Section title="Card" description="Surface with optional hover lift.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6">
              <TruckIcon className="h-8 w-8 text-primary-600" aria-hidden="true" />
              <h3 className="mt-3 font-bold text-ink">Same-day dispatch</h3>
              <p className="mt-1 text-sm text-ink-muted">Orders before 3pm leave the warehouse today.</p>
            </Card>
            <Card hover className="p-6">
              <TruckIcon className="h-8 w-8 text-primary-600" aria-hidden="true" />
              <h3 className="mt-3 font-bold text-ink">Hover me</h3>
              <p className="mt-1 text-sm text-ink-muted">Cards lift gently on hover.</p>
            </Card>
            <Card className="p-6 bg-dark-900 text-white">
              <h3 className="font-bold">On dark surface</h3>
              <p className="mt-1 text-sm text-metallic-300">Cards work on any background.</p>
            </Card>
          </div>
        </Section>

        {/* Modal */}
        <Section title="Modal" description="Dialog with backdrop, sizes sm–xl.">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Delete product?">
            <p className="text-ink-muted">
              This will permanently remove the product and its images. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => setModalOpen(false)}>
                Delete
              </Button>
            </div>
          </Modal>
        </Section>

        {/* Tooltip */}
        <Section title="Tooltip" description="Four placements on hover and focus.">
          <div className="flex flex-wrap gap-8 justify-center items-center py-10">
            <Tooltip content="Tooltip on top" position="top">
              <Button variant="outline">Top</Button>
            </Tooltip>
            <Tooltip content="Tooltip on bottom" position="bottom">
              <Button variant="outline">Bottom</Button>
            </Tooltip>
            <Tooltip content="Tooltip on left" position="left">
              <Button variant="outline">Left</Button>
            </Tooltip>
            <Tooltip content="Tooltip on right" position="right">
              <Button variant="outline">Right</Button>
            </Tooltip>
          </div>
        </Section>

        {/* Tabs */}
        <Section title="Tabs" description="Accessible tablist with keyboard navigation.">
          <Tabs defaultValue="overview">
            <TabList aria-label="Product details">
              <Tab value="overview">Overview</Tab>
              <Tab value="fitment">Fitment</Tab>
              <Tab value="reviews">Reviews</Tab>
            </TabList>
            <TabPanel value="overview">
              <p className="text-ink-muted">
                Genuine Mazda brake pad set, ceramic compound, sold with fitting kit.
              </p>
            </TabPanel>
            <TabPanel value="fitment">
              <p className="text-ink-muted">
                Mazda 3 2004–2009 (BK), Mazda 5 2005–2010, Ford Focus C-Max 2003–2010.
              </p>
            </TabPanel>
            <TabPanel value="reviews">
              <p className="text-ink-muted">4.8 / 5 from 214 verified buyers.</p>
            </TabPanel>
          </Tabs>
        </Section>

        {/* Pagination */}
        <Section title="Pagination" description="Page navigation for long lists.">
          <Pagination currentPage={currentPage} totalPages={8} onPageChange={setCurrentPage} />
          <p className="mt-3 text-sm text-ink-subtle">Current page: {currentPage}</p>
        </Section>

        {/* Breadcrumbs */}
        <Section title="Breadcrumbs" description="Trail of links back to the catalogue.">
          <Breadcrumbs
            items={[
              { label: 'Shop', href: '/shop' },
              { label: 'Braking', href: '/shop' },
              { label: 'Brake pads' },
            ]}
          />
        </Section>

        {/* Divider */}
        <Section title="Divider" description="Horizontal, labeled, or vertical separators.">
          <div className="space-y-6">
            <Divider />
            <Divider label="Or continue with" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-ink-muted">Left</span>
              <Divider orientation="vertical" className="h-8" />
              <span className="text-sm text-ink-muted">Right</span>
            </div>
          </div>
        </Section>

        {/* Skeleton */}
        <Section title="Skeleton" description="Loading placeholders.">
          <div className="flex items-start gap-8">
            <div className="flex items-start gap-3">
              <SkeletonCircle />
              <div className="w-56">
                <SkeletonText lines={3} />
              </div>
            </div>
            <Skeleton className="h-32 w-56" />
          </div>
        </Section>

        {/* LoadingSpinner */}
        <Section title="LoadingSpinner" description="Inline and page-level loading states.">
          <div className="flex items-center gap-8">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
          </div>
        </Section>

        {/* EmptyState */}
        <Section title="EmptyState" description="Empty lists, carts, and search results.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EmptyState
              icon={<MagnifyingGlassIcon className="h-16 w-16" />}
              title="No results found"
              description="Try adjusting your search or filters to find what you're looking for."
            />
            <EmptyState
              icon={<ShoppingCartIcon className="h-16 w-16" />}
              title="Your cart is empty"
              description="Browse the catalogue and add parts to get started."
              action={{ label: 'Browse products', onClick: () => toast.info('Demo action — nothing happened') }}
            />
          </div>
        </Section>

        {/* SearchBar */}
        <Section title="SearchBar" description="Type-ahead search input.">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search brake pads, oil filters..."
            className="max-w-md"
          />
          <p className="mt-3 text-sm text-ink-subtle">Current value: {searchValue || '(empty)'}</p>
        </Section>

        {/* Toast */}
        <Section
          title="Toast"
          description="Transient feedback. Triggered from anywhere via the `toast` API."
        >
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => toast.success('Product saved to inventory', { duration: 3000 })}>
              Success
            </Button>
            <Button variant="danger" onClick={() => toast.error('Upload failed — image is too large', { duration: 3000 })}>
              Error
            </Button>
            <Button variant="outline" onClick={() => toast.info('3 new orders since yesterday', { duration: 3000 })}>
              Info
            </Button>
            <Button variant="secondary" onClick={() => toast.warning('Stock is low on 2 items', { duration: 3000 })}>
              Warning
            </Button>
            <Button variant="ghost" onClick={() => toast.dismiss()}>
              Dismiss all
            </Button>
          </div>
        </Section>

        <Divider />

        <footer className="pb-12 text-sm text-ink-subtle">
          <p>
            Full reference in <span className="font-semibold text-ink">DESIGN-SYSTEM.md</span>.
            All components ship with unit tests and are importable from{' '}
            <code className="px-1.5 py-0.5 rounded bg-surface-muted border border-line text-primary-700">
              @/components/common
            </code>
            .
          </p>
        </footer>
      </main>
    </div>
  );
};