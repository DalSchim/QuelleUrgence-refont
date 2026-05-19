'use client';

import { useState } from 'react';
import { CreateOperatorCallInput } from '@/types/operator';
import OperatorCallForm from '@/components/operateur/OperatorCallForm';
import styles from './page.module.scss';

// Define steps and step labels
const steps = ['patient', 'symptoms', 'result'] as const;
const stepLabels: Record<typeof steps[number], string> = {
  patient: 'Informations Patient',
  symptoms: 'Symptômes',
  result: 'Résultat',
};

// Define common symptoms
const COMMON_SYMPTOMS = ['Fièvre', 'Toux', 'Douleur', 'Fatigue'];

export default function OperateurPage() {
  const [step, setStep] = useState<typeof steps[number]>('patient');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: 'homme',
    phone: '',
    email: '',
    symptoms: [] as string[],
    symptomDescription: '',
    durationHours: '',
    hasChronicConditions: false,
  });

  const toggleSymptom = (symptom: string) => {
    setForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const handleFormSubmit = async (callData: CreateOperatorCallInput) => {
    setError(null);
    setLoading(true);

    try {
      // TODO: Remplacer par le vrai ID de l'opérateur connecté
      const operatorId = 'current-operator-id';

      const response = await fetch('/api/operators/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...callData,
          operatorId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'enregistrement');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);

      console.log('Appel enregistré avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className="text-white px-6 py-4 flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">QuelleUrgence — Interface Opérateur</h1>
          <p className="text-sm text-gray-400">Formulaire de triage médical</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {step !== 'result' && (
          <nav className="flex gap-1 mb-8" aria-label="Étapes">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    steps.indexOf(step) >= i ? 'bg-[#1a1a2e]' : 'bg-gray-200'
                  }`}
                />
                {i < steps.length - 1 && <div className="w-1" />}
              </div>
            ))}
          </nav>
        )}

        {step !== 'result' && (
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {stepLabels[step]}
          </h2>
        )}

        {step === 'patient' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prénom" required>
                <input className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Jean" />
              </Field>
              <Field label="Nom" required>
                <input className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Dupont" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Âge" required>
                <input className="input" type="number" min={0} max={120} value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="45" />
              </Field>
              <Field label="Sexe" required>
                <select className="input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value as 'homme' | 'femme' | 'autre' }))}>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                  <option value="autre">Autre</option>
                </select>
              </Field>
            </div>
            <Field label="Téléphone">
              <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="06 12 34 56 78" />
            </Field>
            <Field label="Email" required>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jean.dupont@email.fr" />
            </Field>
            <button
              className="btn-primary w-full mt-2"
              disabled={!form.firstName || !form.lastName || !form.age || !form.email}
              onClick={() => setStep('symptoms')}
            >
              Suivant →
            </button>
          </div>
        )}

        {step === 'symptoms' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Symptômes (sélectionner tous ceux qui s'appliquent)</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOMS.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      form.symptoms.includes(s)
                        ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Field label="Description détaillée des symptômes" required>
              <textarea
                className="input min-h-[100px] resize-none"
                value={form.symptomDescription}
                onChange={e => setForm(f => ({ ...f, symptomDescription: e.target.value }))}
                placeholder="Décrivez les symptômes en détail : intensité, localisation, évolution..."
              />
            </Field>

            <Field label="Depuis combien d'heures ?" required>
              <input className="input" type="number" min={1} value={form.durationHours} onChange={e => setForm(f => ({ ...f, durationHours: e.target.value }))} placeholder="Ex : 3" />
            </Field>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" checked={form.hasChronicConditions} onChange={e => setForm(f => ({ ...f, hasChronicConditions: e.target.checked }))} />
                <span className="text-sm text-gray-700">Antécédents médicaux / maladies chroniques</span>
              </label>
              {form.hasChronicConditions && (
                <input className="input" value={form.chronicConditions} onChange={e => setForm(f => ({ ...f, chronicConditions: e.target.value }))} placeholder="Ex : diabète, hypertension, insuffisance cardiaque..." />
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" checked={form.hasAllergies} onChange={e => setForm(f => ({ ...f, hasAllergies: e.target.checked }))} />
                <span className="text-sm text-gray-700">Allergies connues</span>
              </label>
              {form.hasAllergies && (
                <input className="input" value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} placeholder="Ex : pénicilline, aspirine, arachides..." />
              )}
            </div>

            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setStep('patient')}>← Retour</button>
              <button
                className="btn-primary flex-1"
                disabled={!form.symptomDescription || !form.durationHours}
                onClick={() => setStep('location')}
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {step === 'location' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <p className="text-sm text-gray-600">La localisation permet de trouver les hôpitaux les plus proches du patient.</p>

            {locating && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg text-blue-700">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Localisation en cours...
              </div>
            )}

            {form.latitude && form.longitude && !locating && (
              <div className="p-4 bg-green-50 rounded-lg text-green-700 text-sm">
                ✓ Position obtenue : {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}
              </div>
            )}

            <button onClick={locateUser} className="btn-secondary w-full" disabled={locating}>
              {locating ? 'Localisation...' : '📍 Obtenir la position automatiquement'}
            </button>

            <p className="text-xs text-gray-400 text-center">ou saisir manuellement</p>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude">
                <input className="input" type="number" step="any" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} placeholder="48.8566" />
              </Field>
              <Field label="Longitude">
                <input className="input" type="number" step="any" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} placeholder="2.3522" />
              </Field>
            </div>

            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setStep('symptoms')}>← Retour</button>
              <button
                className="btn-primary flex-1"
                disabled={!form.latitude || !form.longitude}
                onClick={() => setStep('confirm')}
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Patient</h3>
              <p className="font-medium">{form.firstName} {form.lastName}, {form.age} ans ({form.gender})</p>
              <p className="text-sm text-gray-600">{form.email} · {form.phone}</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Symptômes</h3>
              {form.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {form.symptoms.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{s}</span>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-600">{form.symptomDescription}</p>
              <p className="text-sm text-gray-500">Durée : {form.durationHours}h{form.hasChronicConditions && ` · Antécédents : ${form.chronicConditions}`}{form.hasAllergies && ` · Allergies : ${form.allergies}`}</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Localisation</h3>
              <p className="text-sm text-gray-600">{parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}</p>
            </section>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setStep('location')} disabled={loading}>← Retour</button>
              <button className="btn-primary flex-1" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyse en cours...
                  </span>
                ) : 'Créer le dossier'}
              </button>
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
              <h2 className="text-2xl font-bold text-gray-800">Dossier créé</h2>
              <p className="text-gray-500 text-sm">{result.message}</p>

              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Code d'accès</p>
                <p className="text-4xl font-bold tracking-widest text-[#1a1a2e]">{result.accessCode}</p>
              </div>

              {result.qrCodeDataUrl && (
                <div className="flex flex-col items-center gap-2">
                  <img src={result.qrCodeDataUrl} alt="QR Code d'accès" className="w-48 h-48 rounded-xl" />
                  <p className="text-xs text-gray-400">QR Code à scanner par le médecin</p>
                </div>
              )}
            </div>

            <button className="btn-secondary w-full" onClick={reset}>
              Nouveau dossier
            </button>
          </div>
        )}
      </main>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          background: white;
        }
        .input:focus {
          border-color: #1a1a2e;
          box-shadow: 0 0 0 3px rgba(26,26,46,0.08);
        }
        .btn-primary {
          background: #1a1a2e;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          transition: opacity 0.2s;
          cursor: pointer;
        }
        .btn-primary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: white;
          color: #374151;
          border: 1px solid #e5e7eb;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .btn-secondary:hover {
          border-color: #9ca3af;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
