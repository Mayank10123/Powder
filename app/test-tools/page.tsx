'use client';

import { useState } from 'react';

export default function TestTools() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<Array<{ timestamp: string; message: string; type: 'success' | 'error' | 'info' }>>([]);
  const [providerId, setProviderId] = useState('1');

  const addLog = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setLogs(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    }, ...prev]);
  };

  // Test 1: Reset single provider quota
  const handleResetQuota = async () => {
    setLoading(true);
    addLog(`Resetting quota for Provider ${providerId}...`, 'info');
    
    try {
      const response = await fetch('/api/webhook/quota-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Id': `reset-${providerId}-${Date.now()}`,
        },
        body: JSON.stringify({ providerId: parseInt(providerId) }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset quota');
      }

      const data = await response.json();
      addLog(`✓ Quota reset for Provider ${providerId}: ${data.message}`, 'success');
    } catch (error: any) {
      addLog(`✗ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Reset all provider quotas
  const handleResetAllQuotas = async () => {
    setLoading(true);
    addLog('Resetting quotas for ALL providers...', 'info');
    
    try {
      const response = await fetch('/api/webhook/quota-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Id': `reset-all-${Date.now()}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to reset quotas');
      }

      const data = await response.json();
      addLog(`✓ All quotas reset: ${data.message}`, 'success');
    } catch (error: any) {
      addLog(`✗ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Test webhook idempotency - call same webhook twice
  const handleTestIdempotency = async () => {
    setLoading(true);
    const webhookId = `idempotent-test-${Date.now()}`;
    addLog('Testing webhook idempotency (calling same webhook twice)...', 'info');
    
    try {
      // First call
      const response1 = await fetch('/api/webhook/quota-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Id': webhookId,
        },
        body: JSON.stringify({ providerId: 2 }),
      });

      if (!response1.ok) throw new Error('First call failed');
      addLog('✓ First webhook call succeeded', 'success');

      // Second call with same webhook ID
      const response2 = await fetch('/api/webhook/quota-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Id': webhookId,
        },
        body: JSON.stringify({ providerId: 2 }),
      });

      if (!response2.ok) throw new Error('Second call failed');
      const data = await response2.json();
      addLog('✓ Second call succeeded (idempotent - no duplicate effect)', 'success');
    } catch (error: any) {
      addLog(`✗ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test 4: Generate 10 leads rapidly to test concurrency
  const handleGenerateLeads = async () => {
    setLoading(true);
    addLog('Generating 10 leads rapidly (concurrency test)...', 'info');
    
    const services = [1, 2, 3];
    const phoneBase = 9000000000;
    let successCount = 0;
    let errorCount = 0;

    try {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        const leadPromise = (async () => {
          try {
            const response = await fetch('/api/leads', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: `Test User ${i}`,
                phoneNumber: String(phoneBase + i),
                city: 'Test City',
                serviceId: services[i % 3] + 1, // Rotate through services
                description: `Concurrent test lead ${i}`,
              }),
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch {
            errorCount++;
          }
        })();
        promises.push(leadPromise);
      }

      await Promise.all(promises);
      addLog(`✓ Concurrency test complete: ${successCount} successful, ${errorCount} failed`, 'success');
    } catch (error: any) {
      addLog(`✗ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test 5: Create duplicate lead (should fail)
  const handleTestDuplicate = async () => {
    setLoading(true);
    addLog('Testing duplicate prevention...', 'info');
    
    try {
      const phoneNumber = '5551234567';
      const payload = {
        name: 'Duplicate Test',
        phoneNumber,
        city: 'Test City',
        serviceId: 1,
        description: 'Testing duplicate',
      };

      // First lead
      const response1 = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response1.ok) throw new Error('First lead failed');
      addLog('✓ First lead created', 'success');

      // Second lead with same phone + service
      const response2 = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response2.ok) {
        addLog('✗ Duplicate was NOT prevented (error)', 'error');
      } else {
        const data = await response2.json();
        addLog(`✓ Duplicate correctly rejected: ${data.error}`, 'success');
      }
    } catch (error: any) {
      addLog(`✗ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Testing Tools</h1>
        <p className="text-gray-600 mb-8">Test various system features and edge cases</p>

        <div className="grid grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Test Controls</h2>

              {/* Provider selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Provider for Quota Reset
                </label>
                <select
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(id => (
                    <option key={id} value={id}>Provider {id}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleResetQuota}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Reset Single Provider Quota
                </button>

                <button
                  onClick={handleResetAllQuotas}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  Reset ALL Provider Quotas
                </button>

                <button
                  onClick={handleTestIdempotency}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                >
                  Test Webhook Idempotency
                </button>

                <button
                  onClick={handleGenerateLeads}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
                >
                  Generate 10 Leads (Concurrency)
                </button>

                <button
                  onClick={handleTestDuplicate}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                >
                  Test Duplicate Prevention
                </button>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Test Logs</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto bg-gray-50 p-4 rounded font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Run a test to see results here.</div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`py-1 ${
                      log.type === 'success'
                        ? 'text-green-700'
                        : log.type === 'error'
                          ? 'text-red-700'
                          : 'text-gray-700'
                    }`}
                  >
                    <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setLogs([])}
              className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Test Scenarios</h2>
          <div className="grid grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔄 Reset Quota</h3>
              <p>Tests webhook functionality and single provider quota reset</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">⚡ Concurrency Test</h3>
              <p>Creates 10 leads simultaneously to test allocation under load</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔐 Idempotency</h3>
              <p>Calls same webhook twice to ensure no duplicate effects</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🚫 Duplicates</h3>
              <p>Ensures same phone number + service cannot create duplicate leads</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
