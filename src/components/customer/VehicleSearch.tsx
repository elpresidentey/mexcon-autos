import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, Button } from '../common';
import {
  getManufacturers,
  getModels,
  getYears,
  getEngineTypes,
} from '../../data/vehicles';

interface VehicleSearchProps {
  variant?: 'card' | 'hero';
  className?: string;
}

/**
 * Hierarchical vehicle search: manufacturer -> model -> year -> engine type (Req 3)
 */
export const VehicleSearch = ({ variant = 'card', className = '' }: VehicleSearchProps) => {
  const navigate = useNavigate();

  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [engineType, setEngineType] = useState('');
  const [error, setError] = useState('');

  const manufacturers = getManufacturers();
  const models = manufacturer ? getModels(manufacturer) : [];
  const years = manufacturer && model ? getYears(manufacturer, model) : [];
  const engineTypes = manufacturer && model ? getEngineTypes(manufacturer, model, year ? Number(year) : undefined) : [];

  const handleManufacturerChange = (value: string) => {
    setManufacturer(value);
    setModel('');
    setYear('');
    setEngineType('');
    setError('');
  };

  const handleModelChange = (value: string) => {
    setModel(value);
    setYear('');
    setEngineType('');
    setError('');
  };

  const handleYearChange = (value: string) => {
    setYear(value);
    setEngineType('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!manufacturer) {
      setError('Please select a vehicle manufacturer');
      return;
    }

    const params = new URLSearchParams();
    params.set('manufacturer', manufacturer);
    if (model) params.set('model', model);
    if (year) params.set('year', year);
    if (engineType) params.set('engine_type', engineType);

    navigate(`/shop?${params.toString()}`);
  };

  const isHero = variant === 'hero';

  return (
    <form
      onSubmit={handleSubmit}
      className={`${isHero
        ? 'bg-white/95 text-dark-900 border border-white/30 p-5 lg:p-6 shadow-xl [&_label]:text-metallic-700'
        : 'bg-white border border-metallic-200 p-5'} ${className}`}
    >
      {isHero && (
        <div className="mb-4">
          <h2 className="font-display text-xl font-bold tracking-wide uppercase text-dark-900">
            Search by vehicle
          </h2>
          <p className="text-sm text-metallic-600 mt-0.5">
            Manufacturer, model, year, and engine
          </p>
        </div>
      )}

      <div className={`${isHero ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end'}`}>
        <Select
          label="Manufacturer"
          value={manufacturer}
          onChange={(e) => handleManufacturerChange(e.target.value)}
          options={[
            { value: '', label: 'Select Manufacturer' },
            ...manufacturers.map((name) => ({ value: name, label: name })),
          ]}
          className={isHero ? 'bg-white text-dark-900 [color-scheme:light]' : ''}
        />

        <Select
          label="Model"
          value={model}
          onChange={(e) => handleModelChange(e.target.value)}
          options={[
            { value: '', label: model === '' && manufacturer ? 'No models available' : 'Select Model' },
            ...models.map((m) => ({ value: m.name, label: m.name })),
          ]}
          disabled={!manufacturer}
          className={isHero ? 'bg-white text-dark-900 [color-scheme:light]' : ''}
        />

        <Select
          label="Year"
          value={year}
          onChange={(e) => handleYearChange(e.target.value)}
          options={[
            { value: '', label: 'Select Year' },
            ...years.map((y) => ({ value: String(y), label: String(y) })),
          ]}
          disabled={!model}
          className={isHero ? 'bg-white text-dark-900 [color-scheme:light]' : ''}
        />

        <Select
          label="Engine Type"
          value={engineType}
          onChange={(e) => setEngineType(e.target.value)}
          options={[
            { value: '', label: 'Any Engine' },
            ...engineTypes.map((et) => ({ value: et, label: et })),
          ]}
          disabled={!model}
          className={isHero ? 'bg-white text-dark-900 [color-scheme:light]' : ''}
        />

        {!isHero && (
          <Button type="submit" className="w-full">
            Search Parts
          </Button>
        )}
      </div>

      {isHero && (
        <Button
          type="submit"
          className="mt-4 w-full bg-accent-500 text-black hover:bg-accent-400 font-semibold text-sm"
        >
          Search Parts
        </Button>
      )}

      {error && (
        <p className="text-red-600 text-sm mt-3 font-medium" role="alert">
          {error}
        </p>
      )}
    </form>
  );
};

export default VehicleSearch;
