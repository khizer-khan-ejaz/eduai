import React from 'react';

const StudentProgress = ({ studentStats }) => {
  return (
    <div className="dashboard-grid grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      
      {/* Top Level Stats */}
      <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="text-gray-500 text-sm font-medium">Overall Accuracy</div>
          <div className="text-3xl font-bold text-green-600 mt-2">78%</div>
        </div>
        <div className="stat-card p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="text-gray-500 text-sm font-medium">Questions Attempted</div>
          <div className="text-3xl font-bold mt-2 text-gray-800">452</div>
        </div>
        <div className="stat-card p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="text-gray-500 text-sm font-medium">Time Spent</div>
          <div className="text-3xl font-bold mt-2 text-gray-800">12h 45m</div>
        </div>
      </div>

      {/* Weak Areas Module */}
      <div className="col-span-1 md:col-span-2 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Focus Areas (Needs Improvement)</h3>
        <ul className="space-y-4">
          <li className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-red-50 border border-red-100 rounded-lg">
            <div>
              <div className="font-semibold text-red-900">Surface Areas and Volumes</div>
              <div className="text-sm text-red-700 mt-1">Accuracy: 45% • 12 mistakes</div>
            </div>
            <button className="whitespace-nowrap px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-md text-sm font-medium shadow-sm">
              Practice Now
            </button>
          </li>
          <li className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-orange-50 border border-orange-100 rounded-lg">
            <div>
              <div className="font-semibold text-orange-900">Polynomials</div>
              <div className="text-sm text-orange-700 mt-1">Accuracy: 58% • 8 mistakes</div>
            </div>
            <button className="whitespace-nowrap px-4 py-2 bg-orange-600 hover:bg-orange-700 transition-colors text-white rounded-md text-sm font-medium shadow-sm">
              Review Concept
            </button>
          </li>
        </ul>
      </div>

      {/* Recommended Next Step */}
      <div className="col-span-1 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-sm flex flex-col justify-between border border-blue-800">
        <div>
          <div className="inline-block px-2 py-1 bg-blue-500/30 rounded text-blue-100 text-xs font-bold uppercase tracking-wider mb-4">
            Recommended
          </div>
          <h3 className="text-xl font-bold mb-2">Master Heron's Formula</h3>
          <p className="text-sm text-blue-100 mb-6 leading-relaxed">
            Based on your recent progress in Geometry, this topic will help you calculate areas faster.
          </p>
        </div>
        <button className="w-full py-3 bg-white hover:bg-gray-50 transition-colors text-blue-700 font-bold rounded-lg shadow-sm">
          Start Interactive Lesson
        </button>
      </div>

    </div>
  );
};
export default StudentProgress;