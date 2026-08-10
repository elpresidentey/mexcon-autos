// Hierarchical vehicle data for the vehicle-based search (Req 3)
// manufacturer -> models -> years -> engine types

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
    name: 'Honda',
    models: [
      { name: 'Accord', years: [1994, 1998, 2003, 2008, 2013, 2017, 2021], engineTypes: ['2.2L F22B', '2.4L K24', '3.0L J30A', '3.5L J35Y'] },
      { name: 'Civic', years: [1996, 2000, 2005, 2010, 2015, 2018, 2021], engineTypes: ['1.5L D15B', '1.8L R18A', '2.0L K20', '1.5L L15B Turbo'] },
      { name: 'CR-V', years: [1997, 2002, 2006, 2010, 2015, 2018, 2021], engineTypes: ['2.0L B20', '2.4L K24', '1.5L L15B Turbo'] },
      { name: 'Pilot', years: [2003, 2006, 2010, 2013, 2016, 2019], engineTypes: ['3.5L J35A', '3.5L J35Y'] },
      { name: 'Odyssey', years: [1995, 2000, 2004, 2008, 2012, 2016, 2019], engineTypes: ['2.2L F22B', '3.5L J35A'] },
      { name: 'Fit / Jazz', years: [2002, 2007, 2011, 2014, 2018, 2020], engineTypes: ['1.3L L13A', '1.5L L15A', '1.5L L15B'] },
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
    name: 'Mazda',
    models: [
      { name: 'Mazda 3', years: [2004, 2008, 2011, 2014, 2017, 2020], engineTypes: ['2.0L LF', '2.3L L3', '2.5L PY'] },
      { name: 'Mazda 6', years: [2003, 2006, 2009, 2012, 2014, 2017, 2020], engineTypes: ['2.0L L8', '2.3L L3', '2.5L PY'] },
      { name: 'CX-5', years: [2012, 2015, 2017, 2019, 2021], engineTypes: ['2.0L PE', '2.5L PY', '2.2L SH-VPTS Diesel'] },
      { name: 'CX-9', years: [2007, 2010, 2013, 2016, 2019, 2021], engineTypes: ['3.7L MZI', '2.5L PY Turbo'] },
      { name: 'Demio / Mazda 2', years: [2003, 2007, 2010, 2014, 2017, 2020], engineTypes: ['1.3L ZJ', '1.5L ZY', '1.5L P5'] },
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
    name: 'Subaru',
    models: [
      { name: 'Impreza', years: [1998, 2002, 2006, 2010, 2014, 2017, 2020], engineTypes: ['2.0L EJ20', '2.5L EJ25', '2.0L FB20'] },
      { name: 'Forester', years: [1998, 2002, 2005, 2009, 2013, 2016, 2019], engineTypes: ['2.0L EJ20', '2.5L EJ25', '2.5L FB25'] },
      { name: 'Outback', years: [1999, 2003, 2006, 2010, 2013, 2016, 2019], engineTypes: ['2.5L EJ25', '3.6L EZ36'] },
      { name: 'Legacy', years: [1999, 2003, 2006, 2010, 2013, 2016, 2019], engineTypes: ['2.5L EJ25', '3.6L EZ36'] },
      { name: 'XV Crosstrek', years: [2013, 2015, 2018, 2020], engineTypes: ['2.0L FB20', '2.5L FB25'] },
    ],
  },
  {
    name: 'Suzuki',
    models: [
      { name: 'Swift', years: [2005, 2008, 2011, 2014, 2017, 2020], engineTypes: ['1.3L M13A', '1.5L M15A', '1.2L K12M'] },
      { name: 'Vitara', years: [2005, 2008, 2011, 2015, 2017, 2020], engineTypes: ['1.6L M16A', '1.4L K14C Turbo'] },
      { name: 'Jimny', years: [1998, 2004, 2008, 2012, 2018, 2021], engineTypes: ['1.3L M13A', '1.5L K15B'] },
      { name: 'Grand Vitara', years: [2000, 2005, 2008, 2012, 2015], engineTypes: ['2.0L J20A', '2.4L J24B'] },
    ],
  },
  {
    name: 'Isuzu',
    models: [
      { name: 'D-Max', years: [2002, 2008, 2012, 2016, 2019, 2021], engineTypes: ['2.5L 4JA1 Diesel', '3.0L 4JJ1 Diesel', '1.9L RZ4E Diesel'] },
      { name: 'Trooper', years: [1995, 1999, 2002, 2004], engineTypes: ['3.1L 4JG2 Diesel', '3.5L 6VE1'] },
      { name: 'MU-7', years: [2005, 2008, 2012], engineTypes: ['3.0L 4JJ1 Diesel'] },
    ],
  },
  {
    name: 'Daihatsu',
    models: [
      { name: 'Terios', years: [1998, 2002, 2006, 2008, 2012, 2016], engineTypes: ['1.3L K3-VE', '1.5L 3SZ-VE'] },
      { name: 'Mira / Cuore', years: [1998, 2002, 2006, 2009, 2013, 2018], engineTypes: ['0.66L EF', '0.66L KF'] },
      { name: 'Move', years: [1998, 2002, 2006, 2010, 2014, 2018], engineTypes: ['0.66L EF', '0.66L KF'] },
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
  {
    name: 'Genesis',
    models: [
      { name: 'Genesis G80', years: [2017, 2019, 2021], engineTypes: ['3.8L G6DN', '3.3L G6DP Turbo'] },
      { name: 'Genesis GV80', years: [2021], engineTypes: ['3.5L G6DP Turbo'] },
    ],
  },
  {
    name: 'KG Mobility (SsangYong)',
    models: [
      { name: 'Rexton', years: [2003, 2008, 2012, 2014, 2017, 2020], engineTypes: ['2.7L D27DT Diesel', '2.2L D22DTR Diesel'] },
      { name: 'Korando', years: [2011, 2014, 2017, 2020], engineTypes: ['2.0L D20DTF Diesel', '1.5L G15T Turbo'] },
      { name: 'Tivoli', years: [2015, 2017, 2019, 2021], engineTypes: ['1.6L G16D', '1.6L D16T Diesel'] },
      { name: 'Musso', years: [2018, 2020], engineTypes: ['2.2L D22DTR Diesel'] },
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
