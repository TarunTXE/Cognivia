import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import FormField, { Input, Select } from '../components/FormField';
import { generateNotes } from '../services/api';

function SectionNumber({ n, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-700',
    red:    'bg-red-100 text-red-700',
    green:  'bg-emerald-100 text-emerald-700',
    violet: 'bg-violet-100 text-violet-700',
    sky:    'bg-sky-100 text-sky-700',
    amber:  'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`w-6 h-6 ${colors[color]} rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0`}>
      {n}
    </span>
  );
}

export default function AINotes() {
  const location = useLocation();
  const [topic, setTopic] = useState(location.state?.topic || '');
  const [difficulty, setDifficulty] = useState(location.state?.difficulty || '');
  const [notes, setNotes] = useState(null);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleGenerate = async () => {
    const e = {};
    if (!topic.trim()) e.topic = 'Please enter a topic.';
    if (!difficulty) e.difficulty = 'Please select a difficulty.';
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const data = await generateNotes({
        topic: topic.trim(),
        difficulty,
      });
      setNotes(data);
      setGenerated(true);
    } catch (err) {
      setErrors({
        general: err.message || 'Failed to generate notes. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-600">Knowledge Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">AI-Powered Notes</h1>
          <p className="mt-2 text-slate-500">Enter a topic to generate structured study notes tailored to your level.</p>
        </div>

        {/* General Error Banner */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-red-800">Generation Failed</p>
              <p className="mt-0.5 text-red-700">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Input Card */}
        <Card className="mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <FormField label="Topic" id="topic" required error={errors.topic} className="flex-1">
              <Input
                id="topic"
                placeholder="e.g. Binary Search Trees"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (errors.topic || errors.general) setErrors((p) => ({ ...p, topic: undefined, general: undefined }));
                }}
              />
            </FormField>
            <FormField label="Difficulty" id="diff" required error={errors.difficulty} className="sm:w-44">
              <Select
                id="diff"
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  if (errors.difficulty || errors.general) setErrors((p) => ({ ...p, difficulty: undefined, general: undefined }));
                }}
              >
                <option value="">Select level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </Select>
            </FormField>
            <div className="flex items-end">
              <Button onClick={handleGenerate} disabled={loading} size="md" className="whitespace-nowrap">
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Generating…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3" />
                    </svg>
                    Generate Notes
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 card-shadow">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                  <div className="h-3 bg-slate-100 rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!generated && !loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-violet-50 border border-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-slate-700 font-semibold mb-1">Ready to generate notes</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Enter a topic above and select a difficulty level, then click Generate Notes to create your AI study notes.
            </p>
          </div>
        )}

        {/* Notes output */}
        {generated && notes && (
          <div className="space-y-5">

            {/* Notes header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{notes.topic || topic}</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Difficulty: <span className="font-medium text-slate-700">{notes.difficulty || difficulty}</span>
                </p>
              </div>
              <Badge variant="indigo">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1" />
                </svg>
                AI Generated
              </Badge>
            </div>

            {/* 1 — Overview */}
            {notes.sections?.overview && (
              <Card>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <SectionNumber n="1" color="indigo" />
                  Overview
                </h3>
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                  <p className="text-sm text-slate-700 leading-relaxed">{notes.sections.overview}</p>
                </div>
              </Card>
            )}

            {/* 2 — Key Concepts */}
            {Array.isArray(notes.sections?.keyConcepts) && notes.sections.keyConcepts.length > 0 && (
              <Card>
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <SectionNumber n="2" color="violet" />
                  Key Concepts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {notes.sections.keyConcepts.map((kc, idx) => (
                    <div key={kc.title || idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-violet-200 transition-colors duration-150">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                        <h4 className="text-sm font-semibold text-slate-900">{kc.title}</h4>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{kc.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 3 — Definitions */}
            {Array.isArray(notes.sections?.definitions) && notes.sections.definitions.length > 0 && (
              <Card>
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <SectionNumber n="3" color="sky" />
                  Definitions
                </h3>
                <div className="divide-y divide-slate-100">
                  {notes.sections.definitions.map((d, idx) => (
                    <div key={d.term || idx} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                      <span className="text-sm font-semibold text-indigo-700 min-w-36 flex-shrink-0 pt-0.5">{d.term}</span>
                      <span className="text-sm text-slate-600 leading-relaxed">{d.definition}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 4 — Examples */}
            {Array.isArray(notes.sections?.examples) && notes.sections.examples.length > 0 && (
              <Card>
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <SectionNumber n="4" color="amber" />
                  Code Examples
                </h3>
                <div className="space-y-5">
                  {notes.sections.examples.map((ex, idx) => (
                    <div key={ex.title || idx}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <h4 className="text-sm font-semibold text-slate-800">{ex.title}</h4>
                      </div>
                      <pre className="bg-slate-900 text-emerald-400 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed font-mono border border-slate-800">
                        {ex.code}
                      </pre>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 5 — Common Mistakes */}
            {Array.isArray(notes.sections?.commonMistakes) && notes.sections.commonMistakes.length > 0 && (
              <Card>
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <SectionNumber n="5" color="red" />
                  Common Mistakes
                </h3>
                <div className="space-y-3">
                  {notes.sections.commonMistakes.map((m, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg p-3">
                      <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-sm text-red-800 leading-relaxed">{typeof m === 'string' ? m : m?.mistake || JSON.stringify(m)}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 6 — Quick Revision */}
            {Array.isArray(notes.sections?.quickRevision) && notes.sections.quickRevision.length > 0 && (
              <Card>
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <SectionNumber n="6" color="green" />
                  Quick Revision
                </h3>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <ul className="space-y-2.5">
                    {notes.sections.quickRevision.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-emerald-900">
                        <svg className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">{typeof r === 'string' ? r : r?.point || JSON.stringify(r)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
