import React from 'react';

const CreatePost = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
        <p className="mt-2 text-gray-600">
          Create and schedule content across multiple social media platforms
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">Post Creator</h3>
            <p className="mt-1 text-sm text-gray-500">
              The cross-platform content composer will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
