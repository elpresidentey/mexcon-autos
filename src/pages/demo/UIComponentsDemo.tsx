import { useState } from 'react';
import {
  Pagination,
  SearchBar,
  Badge,
  Alert,
  Tooltip,
  Breadcrumbs,
  EmptyState,
  Button,
  Card,
} from '../../components/common';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';

export const UIComponentsDemo = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [showAlert, setShowAlert] = useState(true);

  const breadcrumbItems = [
    { label: 'Products', href: '/products' },
    { label: 'Auto Parts', href: '/products/auto-parts' },
    { label: 'Engine Components' },
  ];

  return (
    <div className="container-custom py-8 space-y-12">
      <div>
        <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide text-ink mb-2">UI Components Demo</h1>
        <p className="text-metallic-600">
          Testing all newly created UI components
        </p>
      </div>

      {/* SearchBar Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">SearchBar Component</h2>
        <Card className="p-6">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search for auto parts..."
            className="max-w-md"
          />
          <p className="mt-4 text-sm text-metallic-600">
            Current value: {searchValue || '(empty)'}
          </p>
        </Card>
      </section>

      {/* Badge Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Badge Component</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Variants:</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Sizes:</h3>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Alert Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Alert Component</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <Alert severity="info" message="This is an informational alert." />
            <Alert
              severity="success"
              message="Your changes have been saved successfully!"
            />
            <Alert
              severity="warning"
              message="Please review your input before submitting."
            />
            <Alert
              severity="error"
              message="An error occurred while processing your request."
            />
            {showAlert && (
              <Alert
                severity="info"
                message="This alert can be closed."
                closable
                onClose={() => setShowAlert(false)}
              />
            )}
            {!showAlert && (
              <Button onClick={() => setShowAlert(true)} size="sm">
                Show Closable Alert
              </Button>
            )}
          </div>
        </Card>
      </section>

      {/* Tooltip Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Tooltip Component</h2>
        <Card className="p-6">
          <div className="flex flex-wrap gap-8 justify-center items-center min-h-[200px]">
            <Tooltip content="Tooltip on top" position="top">
              <Button>Hover Top</Button>
            </Tooltip>
            <Tooltip content="Tooltip on bottom" position="bottom">
              <Button>Hover Bottom</Button>
            </Tooltip>
            <Tooltip content="Tooltip on left" position="left">
              <Button>Hover Left</Button>
            </Tooltip>
            <Tooltip content="Tooltip on right" position="right">
              <Button>Hover Right</Button>
            </Tooltip>
          </div>
        </Card>
      </section>

      {/* Breadcrumbs Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Breadcrumbs Component</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">With Home Icon:</h3>
              <Breadcrumbs items={breadcrumbItems} />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Without Home Icon:</h3>
              <Breadcrumbs items={breadcrumbItems} showHome={false} />
            </div>
          </div>
        </Card>
      </section>

      {/* EmptyState Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">EmptyState Component</h2>
        <Card className="p-6">
          <div className="space-y-8">
            <EmptyState
              icon={<MagnifyingGlassIcon className="h-16 w-16" />}
              title="No results found"
              description="Try adjusting your search or filters to find what you're looking for."
            />
            <EmptyState
              icon={<ShoppingCartIcon className="h-16 w-16" />}
              title="Your cart is empty"
              description="Start shopping to add items to your cart."
              action={{
                label: 'Browse Products',
                onClick: () => alert('Navigate to products'),
              }}
            />
          </div>
        </Card>
      </section>

      {/* Pagination Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Pagination Component</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Few Pages (5 total):</h3>
              <Pagination
                currentPage={currentPage}
                totalPages={5}
                onPageChange={setCurrentPage}
              />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Many Pages (20 total):</h3>
              <Pagination
                currentPage={3}
                totalPages={20}
                onPageChange={() => {}}
              />
            </div>
            <p className="text-sm text-metallic-600">
              Current page: {currentPage}
            </p>
          </div>
        </Card>
      </section>

      {/* Responsive Test */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Responsive Test</h2>
        <Card className="p-6">
          <p className="text-metallic-600 mb-4">
            Resize your browser window to test mobile responsiveness.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <Badge variant="primary">Mobile</Badge>
              <p className="text-sm mt-2">Full width on small screens</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <Badge variant="success">Tablet</Badge>
              <p className="text-sm mt-2">2 columns on medium screens</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <Badge variant="warning">Desktop</Badge>
              <p className="text-sm mt-2">3 columns on large screens</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};
