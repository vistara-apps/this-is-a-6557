import React from 'react';

const Settings = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">Account Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              Profile settings, connected accounts, and preferences will be managed here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
