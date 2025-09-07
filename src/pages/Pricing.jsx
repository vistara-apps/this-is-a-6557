import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      description: 'Perfect for individuals getting started',
      features: [
        '3 social accounts',
        'Basic AI assistance',
        '50 posts per month',
        'Basic analytics',
        'Email support'
      ]
    },
    {
      name: 'Pro',
      price: '$79',
      description: 'Best for growing businesses',
      features: [
        '10 social accounts',
        'Advanced AI content suggestions',
        'Unlimited posts',
        'Advanced analytics',
        'Priority support',
        'Team collaboration'
      ],
      popular: true
    },
    {
      name: 'Business',
      price: '$199',
      description: 'For large teams and enterprises',
      features: [
        'Unlimited social accounts',
        'Custom AI training',
        'Unlimited posts',
        'Enterprise analytics',
        'Dedicated support',
        'Advanced team features',
        'Custom integrations'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Start managing your social media presence with SocialSync AI
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 ${
                plan.popular ? 'border-blue-500 relative' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-blue-500 text-white">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  {plan.name}
                </h2>
                <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">/mo</span>
                </p>
                <button
                  className={`mt-8 block w-full border border-transparent rounded-md py-2 text-sm font-semibold text-center ${
                    plan.popular
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Get started
                </button>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                  What's included
                </h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
