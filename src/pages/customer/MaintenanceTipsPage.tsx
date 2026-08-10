import { Link } from 'react-router-dom';
import { WrenchIcon, BeakerIcon, BoltIcon, SparklesIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export const MaintenanceTipsPage = () => {
  const tips = [
    {
      icon: BeakerIcon,
      title: 'Regular Oil Changes',
      description: 'Change your engine oil every 5,000-7,500 kilometers or as recommended by your manufacturer. Fresh oil reduces engine wear and improves fuel efficiency.',
      color: 'bg-primary-600'
    },
    {
      icon: BoltIcon,
      title: 'Battery Maintenance',
      description: 'Check battery terminals for corrosion and clean them regularly. Test your battery every 6 months, especially before extreme weather seasons.',
      color: 'bg-accent-500'
    },
    {
      icon: WrenchIcon,
      title: 'Brake System Check',
      description: 'Inspect brake pads, rotors, and fluid every 12,000 kilometers. Squeaking or grinding sounds indicate immediate attention is needed.',
      color: 'bg-primary-600'
    },
    {
      icon: SparklesIcon,
      title: 'Air Filter Replacement',
      description: 'Replace air filters every 15,000-20,000 kilometers. A clean filter improves engine performance and fuel economy.',
      color: 'bg-accent-500'
    },
    {
      icon: ClockIcon,
      title: 'Timing Belt Service',
      description: 'Replace timing belts every 60,000-100,000 kilometers. A broken timing belt can cause severe engine damage.',
      color: 'bg-primary-600'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Tire Maintenance',
      description: 'Rotate tires every 8,000-12,000 kilometers and check pressure monthly. Proper alignment extends tire life and improves safety.',
      color: 'bg-accent-500'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-dark-900 text-white py-12 lg:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            Maintenance Tips
          </h1>
          <p className="text-base text-metallic-200 max-w-xl mx-auto">
            Expert advice to keep your vehicle running smoothly and extend its lifespan
          </p>
        </div>
      </section>

      {/* Tips Grid */}
      <div className="container-custom py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tips.map((tip, index) => (
              <div key={index} className="bg-metallic-50 rounded-2xl p-8 border border-metallic-200 hover:shadow-xl transition-shadow">
                <div className={`w-14 h-14 ${tip.color} rounded-xl flex items-center justify-center mb-6 ${tip.color === 'bg-accent-500' ? 'text-black' : 'text-white'}`}>
                  <tip.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-dark-900 mb-3">{tip.title}</h3>
                <p className="text-metallic-700 leading-relaxed">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Tips */}
      <div className="bg-metallic-50 py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl lg:text-2xl font-bold text-dark-900 mb-6 text-center">
              Additional Maintenance Guidelines
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-metallic-200">
                <h3 className="text-lg font-bold text-dark-900 mb-2">Coolant System Flush</h3>
                <p className="text-metallic-700">Flush your coolant system every 2-3 years or 48,000 kilometers to prevent overheating and corrosion.</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-metallic-200">
                <h3 className="text-lg font-bold text-dark-900 mb-2">Transmission Service</h3>
                <p className="text-metallic-700">Check transmission fluid levels regularly and service according to manufacturer recommendations, typically every 48,000-96,000 kilometers.</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-metallic-200">
                <h3 className="text-lg font-bold text-dark-900 mb-2">Suspension Inspection</h3>
                <p className="text-metallic-700">Have your suspension system inspected annually or if you notice unusual noises, vibrations, or uneven tire wear.</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-metallic-200">
                <h3 className="text-lg font-bold text-dark-900 mb-2">Spark Plug Replacement</h3>
                <p className="text-metallic-700">Replace spark plugs every 48,000-96,000 kilometers depending on your vehicle type. Worn plugs reduce fuel efficiency and engine performance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-black text-dark-900 mb-4">
            Need Parts for Your Maintenance?
          </h2>
          <p className="text-lg text-metallic-700 mb-8">
            Browse our extensive catalogue of genuine auto parts for Japanese and Korean vehicles.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop"
              className="inline-flex bg-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-700 transition-colors"
            >
              Browse Parts
            </Link>
            <Link
              to="/quote-request"
              className="inline-flex border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-primary-50 transition-colors"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceTipsPage;
