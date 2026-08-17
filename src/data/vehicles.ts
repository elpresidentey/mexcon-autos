// Hierarchical vehicle data for the vehicle-based search (Req 3)
// manufacturer -> models -> years -> engine types
// Limited to the brands we stock: Lexus, Toyota, Mitsubishi, Nissan, Acura, Kia, Hyundai

export interface VehicleModel {
  name: string;
  years: number[];
  engineTypes: string[];
}

export interface VehicleManufacturer {
  name: string;
  models: VehicleModel[];
}

export const VEHICLES: VehicleManufacturer[] = [
  {
    name: 'Toyota',
    models: [
      { name: 'Camry', years: [1992, 1997, 2002, 2007, 2012, 2017, 2021], engineTypes: ['2.2L 5S-FE', '3.0L 1MZ-FE', '2.4L 2AZ-FE', '2.5L 2AR-FE', '3.5L 2GR-FE'] },
      { name: 'Corolla', years: [1995, 2000, 2003, 2008, 2013, 2017, 2020], engineTypes: ['1.8L 1ZZ-FE', '1.8L 2ZR-FE', '1.6L 1ZR-FE', '2.0L 3ZR-FAE'] },
      { name: 'RAV4', years: [1996, 2001, 2006, 2010, 2013, 2018, 2020], engineTypes: ['2.0L 1AZ-FE', '2.4L 2AZ-FE', '2.5L 2AR-FE'] },
      { name: 'Highlander', years: [2001, 2005, 2008, 2013, 2017, 2020], engineTypes: ['2.4L 2AZ-FE', '3.3L 3MZ-FE', '3.5L 2GR-FE'] },
      { name: 'Land Cruiser', years: [1990, 1998, 2003, 2008, 2013, 2016, 2021], engineTypes: ['4.2L 1HZ Diesel', '4.7L 2UZ-FE', '5.7L 3UR-FE'] },
      { name: 'Hilux', years: [1997, 2002, 2005, 2010, 2015, 2018, 2021], engineTypes: ['2.4L 2L Diesel', '2.7L 2TR-FE', '3.0L 1KD-FTV Diesel', '4.0L 1GR-FE'] },
      { name: 'Prado', years: [1996, 2000, 2003, 2009, 2013, 2018, 2021], engineTypes: ['2.7L 2TR-FE', '3.0L 1KD-FTV Diesel', '4.0L 1GR-FE'] },
      { name: 'Yaris', years: [2000, 2005, 2010, 2014, 2017, 2020], engineTypes: ['1.3L 2NZ-FE', '1.5L 1NZ-FE', '1.5L 2NR-FE'] },
      { name: 'Sienna', years: [1998, 2003, 2007, 2011, 2015, 2018, 2021], engineTypes: ['3.0L 1MZ-FE', '3.3L 3MZ-FE', '3.5L 2GR-FE'] },
      { name: 'Avalon', years: [1995, 2000, 2005, 2010, 2013, 2016, 2019], engineTypes: ['3.0L 1MZ-FE', '3.5L 2GR-FE'] },
    ],
  },
  {
    name: 'Lexus',
    models: [
      { name: 'RX350', years: [2004, 2008, 2010, 2013, 2016, 2020], engineTypes: ['3.5L 2GR-FE', '3.5L 2GR-FKS'] },
      { name: 'ES350', years: [2007, 2010, 2013, 2016, 2019, 2021], engineTypes: ['3.5L 2GR-FE', '3.5L 2GR-FKS'] },
      { name: 'GX460', years: [2010, 2014, 2018, 2021], engineTypes: ['4.6L 1UR-FE'] },
      { name: 'LX570', years: [2008, 2013, 2016, 2021], engineTypes: ['5.7L 3UR-FE'] },
      { name: 'NX300', years: [2015, 2018, 2021], engineTypes: ['2.0L 8AR-FTS Turbo'] },
    ],
  },
  {
    name: 'Nissan',
    models: [
      { name: 'Altima', years: [1998, 2002, 2006, 2010, 2013, 2016, 2019], engineTypes: ['2.4L KA24DE', '2.5L QR25DE', '3.5L VQ35DE'] },
      { name: 'Sentra', years: [1998, 2002, 2007, 2010, 2013, 2016, 2019], engineTypes: ['1.8L QG18DE', '2.0L MR20DE', '1.8L MRA8DE'] },
      { name: 'Pathfinder', years: [1996, 2001, 2005, 2009, 2013, 2017, 2020], engineTypes: ['3.3L VG33E', '4.0L VQ40DE', '3.5L VQ35DE'] },
      { name: 'Rogue', years: [2008, 2011, 2014, 2017, 2020], engineTypes: ['2.5L QR25DE'] },
      { name: 'Patrol', years: [1998, 2004, 2008, 2010, 2016, 2019, 2021], engineTypes: ['4.2L TB42E', '4.8L TB48DE', '4.0L VQ40DE', '5.6L VK56VD'] },
      { name: 'X-Trail', years: [2001, 2004, 2008, 2013, 2017, 2020], engineTypes: ['2.0L QR20DE', '2.5L QR25DE', '2.0L M9R Diesel'] },
    ],
  },
  {
    name: 'Mitsubishi',
    models: [
      { name: 'Lancer', years: [2001, 2005, 2008, 2012, 2015, 2017], engineTypes: ['1.6L 4G18', '2.0L 4B11', '2.4L 4B12'] },
      { name: 'Outlander', years: [2003, 2007, 2010, 2013, 2016, 2019], engineTypes: ['2.4L 4B12', '3.0L 6B31', '2.2L 4N14 Diesel'] },
      { name: 'Pajero', years: [1995, 2000, 2004, 2008, 2012, 2016, 2020], engineTypes: ['2.8L 4M40 Diesel', '3.2L 4M41 Diesel', '3.8L 6G75'] },
      { name: 'Montero Sport', years: [1998, 2003, 2008, 2010, 2016, 2019], engineTypes: ['2.5L 4D56 Diesel', '3.0L 6G72', '2.4L 4N15 Diesel'] },
      { name: 'ASX / RVR', years: [2010, 2013, 2016, 2019], engineTypes: ['1.8L 4J10', '2.0L 4B11'] },
    ],
  },
  {
    name: 'Acura',
    models: [
      { name: 'MDX', years: [2001, 2004, 2008, 2010, 2014, 2017, 2020], engineTypes: ['3.5L J35A', '3.5L J35Y', '3.0L J30Y'] },
      { name: 'TLX', years: [2015, 2018, 2021], engineTypes: ['2.4L K24W', '3.5L J35Y', '2.0L K20C Turbo'] },
      { name: 'RDX', years: [2007, 2010, 2013, 2016, 2019], engineTypes: ['2.3L K23A', '2.0L K20C Turbo'] },
      { name: 'TSX', years: [2004, 2007, 2010, 2012], engineTypes: ['2.4L K24A'] },
    ],
  },
  {
    name: 'Hyundai',
    models: [
      { name: 'Elantra', years: [2001, 2004, 2007, 2010, 2013, 2016, 2019], engineTypes: ['1.8L G4BN', '2.0L G4GC', '2.0L G4NA'] },
      { name: 'Sonata', years: [1998, 2002, 2006, 2009, 2012, 2015, 2019], engineTypes: ['2.4L G4KC', '2.4L G4KE', '3.3L G6DC'] },
      { name: 'Tucson', years: [2004, 2007, 2010, 2013, 2016, 2019], engineTypes: ['2.0L G4GC', '2.0L G4NA', '1.6L G4FJ Turbo'] },
      { name: 'Santa Fe', years: [2001, 2004, 2007, 2010, 2013, 2016, 2019], engineTypes: ['2.4L G4JS', '2.7L G6BA', '2.4L G4KE', '3.3L G6DC'] },
      { name: 'Accent', years: [2001, 2004, 2007, 2010, 2013, 2016, 2019], engineTypes: ['1.5L G4EC', '1.6L G4ED', '1.6L G4FC'] },
      { name: 'Grand Starex', years: [2008, 2011, 2014, 2017, 2019], engineTypes: ['2.5L D4CB Diesel'] },
    ],
  },
  {
    name: 'Kia',
    models: [
      { name: 'Sportage', years: [2001, 2005, 2008, 2010, 2013, 2016, 2019], engineTypes: ['2.0L G4GC', '2.4L G4KE', '1.6L G4FJ Turbo'] },
      { name: 'Optima', years: [2001, 2004, 2007, 2010, 2013, 2016, 2019], engineTypes: ['2.4L G4KC', '2.4L G4KE'] },
      { name: 'Rio', years: [2001, 2004, 2007, 2010, 2013, 2016, 2019], engineTypes: ['1.4L G4EE', '1.6L G4FC', '1.4L G4LC'] },
      { name: 'Sorento', years: [2003, 2006, 2009, 2012, 2015, 2018, 2020], engineTypes: ['2.4L G4JS', '3.3L G6DB', '2.2L D4HB Diesel'] },
      { name: 'Picanto', years: [2004, 2008, 2011, 2014, 2017, 2020], engineTypes: ['1.0L G4HE', '1.2L G4LA'] },
      { name: 'Grand Carnival', years: [2006, 2009, 2012, 2015, 2018, 2020], engineTypes: ['2.2L D4HB Diesel', '3.3L G6DC'] },
    ],
  },
];

export const getManufacturers = (): string[] => VEHICLES.map((m) => m.name);

export const getModels = (manufacturer: string): VehicleModel[] =>
  VEHICLES.find((m) => m.name === manufacturer)?.models || [];

export const getYears = (manufacturer: string, model: string): number[] =>
  getModels(manufacturer).find((m) => m.name === model)?.years || [];

export const getEngineTypes = (manufacturer: string, model: string, year?: number): string[] => {
  const vehicleModel = getModels(manufacturer).find((m) => m.name === model);
  if (!vehicleModel) return [];
  if (year && vehicleModel.years.includes(year)) {
    // Return engine types relevant to that generation
    return vehicleModel.engineTypes;
  }
  return vehicleModel.engineTypes;
};