'use client';

import { useEffect, useMemo, useState } from 'react';
import { clearApiKey, loadApiKeys, saveApiKey } from './storage';
import { PROVIDERS } from './providers';
import type { ApiProvider, StoredApiKeys } from './types';
import { maskApiKey, validateApiKey } from './validators';

export function ApiKeySettingsPanel() {
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider>('GEMINI');
  const [keys, setKeys] = useState<StoredApiKeys>({});
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    setKeys(loadApiKeys());
  }, []);

  const providerConfig = useMemo(
    () => PROVIDERS.find((provider) => provider.id === selectedProvider) || PROVIDERS[0],
    [selectedProvider]
  );

  const savedPreview = useMemo(() => maskApiKey(keys[selectedProvider]), [keys, selectedProvider]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-5 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">API Key Settings</h1>
        <p className="text-sm text-gray-600">
          Add provider keys for agent features. Keys are stored in your current browser profile.
        </p>
      </header>

      <section aria-label="Provider selection" className="flex flex-wrap gap-2">
        {PROVIDERS.map((provider) => {
          const selected = provider.id === selectedProvider;
          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => {
                setSelectedProvider(provider.id);
                setInput('');
                setFeedback(null);
                setFeedbackType(null);
              }}
              aria-pressed={selected}
              className={`rounded-md border px-3 py-2 text-sm ${
                selected ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              {provider.label}
            </button>
          );
        })}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-medium">{providerConfig.label}</p>
        <p className="mt-1 text-xs text-gray-500">{providerConfig.hint}</p>

        <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
          Saved key: <span className="font-mono">{savedPreview}</span>
        </div>

        <label htmlFor="api-key-input" className="mt-4 block text-sm font-medium">
          API key
        </label>
        <input
          id="api-key-input"
          type={showInput ? 'text' : 'password'}
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setFeedback(null);
            setFeedbackType(null);
          }}
          placeholder={providerConfig.placeholder}
          autoComplete="off"
          spellCheck={false}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowInput((prev) => !prev)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {showInput ? 'Hide key' : 'Show key'}
          </button>

          <button
            type="button"
            onClick={() => {
              const validationError = validateApiKey(selectedProvider, input);
              if (validationError) {
                setFeedback(validationError);
                setFeedbackType('error');
                return;
              }

              const updated = saveApiKey(selectedProvider, input);
              setKeys(updated);
              setInput('');
              setFeedback(`${providerConfig.label} key saved.`);
              setFeedbackType('success');
            }}
            className="rounded-md bg-black px-3 py-2 text-sm text-white"
          >
            Save key
          </button>

          <button
            type="button"
            onClick={() => {
              const updated = clearApiKey(selectedProvider);
              setKeys(updated);
              setInput('');
              setFeedback(`${providerConfig.label} key removed.`);
              setFeedbackType('success');
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            Remove key
          </button>
        </div>

        {feedback ? (
          <p className={`mt-3 text-sm ${feedbackType === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>{feedback}</p>
        ) : null}
      </section>
    </main>
  );
}
