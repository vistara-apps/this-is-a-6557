import React from 'react';

const Inbox = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Unified Inbox</h1>
        <p className="mt-2 text-gray-600">
          Manage all your social media interactions in one place
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
            <p className="mt-1 text-sm text-gray-500">
              All your comments, mentions, and messages will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
