import React, { useState } from 'react';

const defaultEnquiries = [
  { id: 1, date: '2026-04-28', name: 'Rahul Sharma', phone: '+91 9876543210', message: 'Interested in Class 9 Maths crash course', status: 'New' },
  { id: 2, date: '2026-04-27', name: 'Priya Verma', phone: '+91 9123456789', message: 'Details about interactive modules', status: 'Contacted' },
  { id: 3, date: '2026-04-25', name: 'Amit Kumar', phone: '+91 9988776655', message: 'Subscription plans for geometry', status: 'Converted' },
];

const EnquiryList = ({ initialEnquiries = defaultEnquiries }) => {
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [filter, setFilter] = useState('All');

  const filteredEnquiries = filter === 'All' 
    ? enquiries 
    : enquiries.filter(e => e.status === filter);

  return (
    <div className="admin-container p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enquiry Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage student and parent queries.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'New', 'Contacted', 'Converted'].map(status => (
            <button 
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === status 
                  ? 'bg-gray-900 text-white shadow-sm' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student/Parent</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredEnquiries.length > 0 ? filteredEnquiries.map((enquiry) => (
              <tr key={enquiry.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{enquiry.date}</td>
                <td className="p-4">
                  <div className="font-medium text-gray-900">{enquiry.name}</div>
                  <div className="text-sm text-gray-500">{enquiry.phone}</div>
                </td>
                <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={enquiry.message}>
                  {enquiry.message}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    enquiry.status === 'New' ? 'bg-blue-100 text-blue-800' :
                    enquiry.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {enquiry.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4 transition-colors">
                    Set Reminder
                  </button>
                  <button className="text-gray-400 hover:text-gray-900 transition-colors" title="Edit">
                    <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  No enquiries found matching this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default EnquiryList;