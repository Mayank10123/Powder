'use client';

import { useEffect, useState } from 'react';

interface Provider {
  id: number;
  name: string;
  leadsReceivedCount: number;
  monthlyQuota: number;
  remainingQuota: number;
  assignments: Array<{
    id: string;
    lead: {
      id: string;
      name: string;
      phoneNumber: string;
      city: string;
      description: string;
      service: { id: number; name: string };
    };
  }>;
}

export default function Dashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/providers');
        const data = await response.json();
        setProviders(data.providers || []);
        if (data.providers && data.providers.length > 0) {
          setSelectedProvider(data.providers[0]);
        }
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch providers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Real-time updates via polling
  useEffect(() => {
    if (!selectedProvider) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/providers?id=${selectedProvider.id}`);
        const data = await response.json();
        if (data.provider) {
          setSelectedProvider(data.provider);
          setLastUpdate(new Date());
          
          // Update the providers list
          setProviders(prev =>
            prev.map(p =>
              p.id === data.provider.id ? data.provider : p
            )
          );
        }
      } catch (error) {
        console.error('Failed to update provider data:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [selectedProvider?.id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Provider Dashboard</h1>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {providers.map(provider => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider)}
              className={`p-4 rounded-lg border-2 transition ${
                selectedProvider?.id === provider.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-lg font-bold text-gray-900">{provider.name}</div>
              <div className="text-sm text-gray-600">
                {provider.leadsReceivedCount}/{provider.monthlyQuota}
              </div>
            </button>
          ))}
        </div>

        {selectedProvider && (
          <div className="grid grid-cols-3 gap-8">
            {/* Stats */}
            <div className="col-span-1 space-y-4">
              <div className="bg-white rounded-lg p-6 shadow">
                <div className="text-sm text-gray-600 mb-2">Quota Status</div>
                <div className="text-3xl font-bold text-indigo-600">
                  {selectedProvider.remainingQuota}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Remaining out of {selectedProvider.monthlyQuota}
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(selectedProvider.leadsReceivedCount / selectedProvider.monthlyQuota) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow">
                <div className="text-sm text-gray-600 mb-2">Leads Received</div>
                <div className="text-3xl font-bold text-gray-900">
                  {selectedProvider.leadsReceivedCount}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow text-xs text-gray-500">
                Last update: {lastUpdate?.toLocaleTimeString()}
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Real-time sync active
                </div>
              </div>
            </div>

            {/* Leads List */}
            <div className="col-span-2 bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Assigned Leads</h2>
              
              {selectedProvider.assignments.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No leads assigned yet</div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedProvider.assignments.map((assignment, idx) => (
                    <div
                      key={assignment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
                    >
                      {assignment.lead ? (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-semibold text-gray-900">{assignment.lead.name}</div>
                              <div className="text-sm text-gray-600">{assignment.lead.phoneNumber}</div>
                            </div>
                            <div className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                              {assignment.lead.service?.name || 'Unknown'}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{assignment.lead.city}</div>
                          <div className="text-sm bg-gray-50 p-2 rounded text-gray-700">
                            {assignment.lead.description}
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500">Lead data unavailable</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
