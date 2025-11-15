import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { makeAuthenticatedRequest } from '../utils/api';
import type { QuizQuestion } from '../types/quizQuestion.types';

const EarnStarsPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();

  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchQuiz = useCallback(async () => {
    if (!courseId || !moduleId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await makeAuthenticatedRequest(
        `/api/study/quiz/${encodeURIComponent(courseId)}/${encodeURIComponent(moduleId)}`
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Quiz fetch failed: ${res.status} ${text}`);
      }
      const data = await res.json();
      const q: QuizQuestion = data?.data || data;
      setQuiz(q);
      setCurrentIndex(0);
      setSelections({});
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch quiz');
      console.error('Error fetching quiz data:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, moduleId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const selectOption = (optionId: string) => {
    setSelections((s) => ({ ...s, [currentIndex]: optionId }));
  };

  const goToDashboardWithContext = () => {
    const params = new URLSearchParams();
    if (courseId) params.set('courseId', courseId);
    if (moduleId) params.set('moduleId', moduleId);
    navigate(`/dashboard?${params.toString()}`, { replace: true });
  };

  const handleNext = () => {
    if (!quiz) return;
    setCurrentIndex((i) => Math.min(i + 1, quiz.questions.length - 1));
  };

  const handlePrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      // compute score
      const answers = quiz.questions.map((q, idx) => ({
        questionId: (q as any)._id || null,
        selectedOptionId: selections[idx] || null,
      }));

      let correctCount = 0;
      quiz.questions.forEach((q, idx) => {
        const sel = selections[idx];
        if (!sel) return;
        const option = (q as any).options.find((o: any) => o._id === sel || o._id === String(sel));
        if (option && option.isCorrect) correctCount++;
      });

      const payload = { answers, score: correctCount };

      // send to backend (endpoint may be implemented server-side)
      const res = await makeAuthenticatedRequest(`/api/study/quiz/${quiz._id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.warn('Submission response:', res.status, text);
        // even if backend endpoint missing, continue to navigate and show result locally
      }

      // Optionally you could await res.json() and show server result
      // Navigate back to dashboard and pass results via query or state if needed
      goToDashboardWithContext();
    } catch (err) {
      console.error('Submit failed', err);
      setError('Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Render
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <header className="p-4 border-b flex items-center justify-between">
        <h1 className="text-lg font-semibold">Earn Stars</h1>
        <button onClick={goToDashboardWithContext} className="px-3 py-1 bg-gray-200 rounded">
          Close
        </button>
      </header>

      <main className="p-6 flex-1 overflow-auto">
        {loading && <div>Loading quiz...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && quiz && (
          <div>
            <div className="mb-4">
              <strong>
                Question {currentIndex + 1} / {quiz.questions.length}
              </strong>
            </div>

            <div className="mb-6">
              <div className="text-xl mb-3">{quiz.questions[currentIndex].text}</div>
              <div className="grid gap-2">
                {(quiz.questions[currentIndex] as any).options.map((opt: any) => {
                  const selected = selections[currentIndex] === String(opt._id);
                  return (
                    <button
                      key={opt._id}
                      className={`rounded p-3 text-left border ${selected ? 'bg-blue-600 text-white' : 'bg-white'}`}
                      onClick={() => selectOption(opt._id)}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>

              {currentIndex < quiz.questions.length - 1 ? (
                <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded">
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Submit'}
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && !quiz && !error && <div>No quiz available for this module.</div>}
      </main>
    </div>
  );
};

export default EarnStarsPage;

