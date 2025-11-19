import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { makeAuthenticatedRequest } from '../utils/api';
import type { QuizQuestion } from '../types/quizQuestion.types';

const QuizPage: React.FC = () => {
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
    // <div className="fixed inset-0 z-50 bg-white flex flex-col">
    //   <header className="p-4 border-b flex items-center justify-between">
    //     <h1 className="text-lg font-semibold">Earn Stars</h1>
    //     <button onClick={goToDashboardWithContext} className="px-3 py-1 bg-gray-200 rounded">
    //       Close
    //     </button>
    //   </header>

    //   <main className="p-6 flex-1 overflow-auto">
    //     {loading && <div>Loading quiz...</div>}
    //     {error && <div className="text-red-600">{error}</div>}

    //     {!loading && quiz && (
    //       <div>
    //         <div className="mb-4">
    //           <strong>
    //             Question {currentIndex + 1} / {quiz.questions.length}
    //           </strong>
    //         </div>

    //         <div className="mb-6">
    //           <div className="text-xl mb-3">{quiz.questions[currentIndex].text}</div>
    //           <div className="grid gap-2">
    //             {(quiz.questions[currentIndex] as any).options.map((opt: any) => {
    //               const selected = selections[currentIndex] === String(opt._id);
    //               return (
    //                 <button
    //                   key={opt._id}
    //                   className={`rounded p-3 text-left border ${selected ? 'bg-blue-600 text-white' : 'bg-white'}`}
    //                   onClick={() => selectOption(opt._id)}
    //                 >
    //                   {opt.text}
    //                 </button>
    //               );
    //             })}
    //           </div>
    //         </div>

    //         <div className="flex items-center gap-4">
    //           <button
    //             disabled={currentIndex === 0}
    //             onClick={handlePrev}
    //             className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
    //           >
    //             Previous
    //           </button>

    //           {currentIndex < quiz.questions.length - 1 ? (
    //             <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded">
    //               Next
    //             </button>
    //           ) : (
    //             <button
    //               onClick={handleSubmit}
    //               disabled={submitting}
    //               className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
    //             >
    //               {submitting ? 'Submitting…' : 'Submit'}
    //             </button>
    //           )}
    //         </div>
    //       </div>
    //     )}

    //     {!loading && !quiz && !error && <div>No quiz available for this module.</div>}
    //   </main>
    // </div>
  <div data-layer="Quiz - q1" className="QuizQ1" style={{position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'white', overflow: 'hidden', zIndex: 50}}>
  <div data-layer="Rectangle 10" className="Rectangle10" style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#191A31'}} />
  <div data-layer="Rectangle 73" className="Rectangle73" style={{width: 13, height: 45, left: 109, top: 704, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 41, height: 12, left: 94, top: 721, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 157, top: 819, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 362, top: 704, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 657, top: 584, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 616, top: 309, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 453, top: 223, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 705.94, top: 1092.62, position: 'absolute', transform: 'rotate(-77deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 641.31, top: 866.62, position: 'absolute', transform: 'rotate(-77deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 592.58, top: 551.90, position: 'absolute', transform: 'rotate(-77deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 315.54, top: 528.38, position: 'absolute', transform: 'rotate(-77deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 194.26, top: 667.15, position: 'absolute', transform: 'rotate(-77deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 747.79, top: 1273.84, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 564.94, top: 1126.14, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 344.06, top: 896.71, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 103.90, top: 1036.80, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 84.50, top: 1220.08, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1601.79, top: 575.84, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1418.94, top: 428.14, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1198.06, top: 198.71, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 957.90, top: 338.80, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 938.51, top: 522.08, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1908.79, top: 621.84, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1725.94, top: 474.14, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1505.06, top: 244.71, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1264.90, top: 384.80, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1245.51, top: 568.08, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1847.79, top: 934.84, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1664.94, top: 787.14, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1444.06, top: 557.71, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1203.90, top: 697.80, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1184.51, top: 881.08, position: 'absolute', transform: 'rotate(-112deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 73" className="Rectangle73" style={{width: 13, height: 45, left: 481, top: 635, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 41, height: 12, left: 466, top: 652, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 73" className="Rectangle73" style={{width: 13, height: 45, left: 509, top: 460, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 41, height: 12, left: 494, top: 477, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 73" className="Rectangle73" style={{width: 13, height: 45, left: 999, top: 460, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 41, height: 12, left: 984, top: 477, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 73" className="Rectangle73" style={{width: 13, height: 45, left: 1391, top: 704, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 41, height: 12, left: 1376, top: 721, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 73" className="Rectangle73" style={{width: 13, height: 45, left: 1406, top: 228, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 41, height: 12, left: 1391, top: 245, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 73" className="Rectangle73" style={{width: 13, height: 45, left: 914, top: 212, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 41, height: 12, left: 899, top: 229, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 73" className="Rectangle73" style={{width: 13, height: 45, left: 1785, top: 455, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 41, height: 12, left: 1770, top: 472, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 73" className="Rectangle73" style={{width: 13, height: 45, left: 921, top: 931, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 41, height: 12, left: 906, top: 948, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 73" className="Rectangle73" style={{width: 13, height: 45, left: 488, top: 886, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 41, height: 12, left: 473, top: 903, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 73" className="Rectangle73" style={{width: 13, height: 45, left: 1746, top: 915, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 41, height: 12, left: 1731, top: 932, position: 'absolute', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1124.39, top: 719.98, position: 'absolute', transform: 'rotate(92deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1232.33, top: 1019.61, position: 'absolute', transform: 'rotate(92deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1508.76, top: 989.80, position: 'absolute', transform: 'rotate(92deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 74" className="Rectangle74" style={{width: 13, height: 12, left: 1601.30, top: 830.42, position: 'absolute', transform: 'rotate(92deg)', transformOrigin: 'top left', background: '#CA8E28'}} />
  <div data-layer="Rectangle 12" className="Rectangle12" style={{width: 1920, height: 95, left: 0, top: 0, position: 'absolute', background: '#BEC5D2'}} />
  <div data-layer="BoxProfile" className="Boxprofile" style={{width: 160, height: 50, left: 1500, top: 22, position: 'absolute', background: '#D9D9D9', borderRadius: 10}} />
  <div data-layer="PROFILE" className="Profile" style={{left: 1518, top: 29, position: 'absolute', textAlign: 'center', color: '#1E1E1E', fontSize: 32, fontFamily: 'Tiny5', fontWeight: '400', wordWrap: 'break-word'}}>PROFILE</div>
  <div data-layer="BoxLogOut" className="Boxlogout" style={{width: 160, height: 50, left: 1688, top: 22, position: 'absolute', background: '#A93511', borderRadius: 10}} />
  <div data-layer="LOG OUT" className="LogOut" style={{left: 1708, top: 29, position: 'absolute', textAlign: 'center', color: 'white', fontSize: 32, fontFamily: 'Tiny5', fontWeight: '400', wordWrap: 'break-word'}}>LOG OUT</div>
  <div data-layer="StarLeap" className="Starleap" style={{left: 127, top: 15, position: 'absolute', textAlign: 'center', color: '#0F1437', fontSize: 58, fontFamily: 'Tiny5', fontWeight: '400', wordWrap: 'break-word'}}>StarLeap</div>
  <div data-layer="Rectangle 233" className="Rectangle233" style={{width: 1477, height: 634, left: 261, top: 322, position: 'absolute', background: '#47546C', borderRadius: 40}} />
  <div data-layer="Rectangle 235" className="Rectangle235" style={{width: 490, height: 634, left: 1248, top: 322, position: 'absolute', background: '#1A2231', borderTopRightRadius: 40, borderBottomRightRadius: 40}} />
  <div data-layer="Question 1" className="Question1" style={{width: 811, height: 39, left: 345, top: 373, position: 'absolute', color: '#BEC5D2', fontSize: 30, fontFamily: 'Tektur', fontWeight: '600', wordWrap: 'break-word'}}>Question 1</div>
  <div data-layer="Is this scene a public or private space?" className="IsThisSceneAPublicOrPrivateSpace" style={{width: 740, height: 39, left: 345, top: 412, position: 'absolute', color: '#BEC5D2', fontSize: 30, fontFamily: 'Tektur', fontWeight: '400', wordWrap: 'break-word'}}>Is this scene a public or private space?</div>
  <img data-layer="Picture1 1" className="Picture11" style={{width: 500, height: 431, left: 345, top: 472, position: 'absolute', borderRadius: 20}} src="https://placehold.co/500x431" />
  <div data-layer="Group 112" data-property-1="Default" className="Group112" style={{width: 285.66, height: 81.13, left: 1366, top: 483, position: 'absolute'}}>
    <div data-layer="Rectangle 14" className="Rectangle14" style={{width: 285.66, height: 81.13, left: 0, top: 0, position: 'absolute', background: 'white', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 20}} />
    <div data-layer="PUBLIC" className="Public" style={{width: 285.66, height: 81.13, left: 0, top: 0, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#45413C', fontSize: 24, fontFamily: 'Inter', fontWeight: '700', lineHeight: 100, wordWrap: 'break-word'}}>PUBLIC</div>
  </div>
  <div data-layer="Group 111" data-property-1="Default" className="Group111" style={{width: 285.66, height: 81.13, left: 1366, top: 617, position: 'absolute'}}>
    <div data-layer="Rectangle 14" className="Rectangle14" style={{width: 285.66, height: 81.13, left: 0, top: 0, position: 'absolute', background: 'white', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 20}} />
    <div data-layer="PUBLIC" className="Public" style={{width: 285.66, height: 81.13, left: 0, top: 0, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#45413C', fontSize: 24, fontFamily: 'Inter', fontWeight: '700', lineHeight: 100, wordWrap: 'break-word'}}>Private</div>
  </div>
  <div data-layer="Group 113" data-property-1="Default" className="Group113" style={{width: 285.66, height: 81.13, left: 1366, top: 483, position: 'absolute'}}>
    <div data-layer="Rectangle 14" className="Rectangle14" style={{width: 285.66, height: 81.13, left: 0, top: 0, position: 'absolute', background: 'white', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 20}} />
    <div data-layer="PUBLIC" className="Public" style={{width: 285.66, height: 81.13, left: 0, top: 0, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#45413C', fontSize: 24, fontFamily: 'Inter', fontWeight: '700', lineHeight: 100, wordWrap: 'break-word'}}>Public</div>
  </div>
  <div data-layer="Group 114" data-property-1="Default" className="Group114" style={{width: 285.66, height: 81.13, left: 1366, top: 617, position: 'absolute'}}>
    <div data-layer="Rectangle 14" className="Rectangle14" style={{width: 285.66, height: 81.13, left: 0, top: 0, position: 'absolute', background: 'white', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 20}} />
    <div data-layer="PUBLIC" className="Public" style={{width: 285.66, height: 81.13, left: 0, top: 0, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#45413C', fontSize: 24, fontFamily: 'Inter', fontWeight: '700', lineHeight: 100, wordWrap: 'break-word'}}>Private</div>
  </div>
  <div data-layer="Group 117" data-property-1="notAvaiable" className="Group117" style={{width: 286, height: 49, left: 1366, top: 828, position: 'absolute', opacity: 0.45}}>
    <div data-layer="Group 116" data-property-1="Default" className="Group116" style={{width: 286, height: 49, left: 0, top: 0, position: 'absolute'}}>
      <div data-layer="Rectangle 14" className="Rectangle14" style={{width: 286, height: 49, left: 0, top: 0, position: 'absolute', background: '#B17F9E', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 20}} />
      <div data-layer="PUBLIC" className="Public" style={{width: 286, height: 49, left: 0, top: 0, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'white', fontSize: 24, fontFamily: 'Inter', fontWeight: '700', lineHeight: 100, wordWrap: 'break-word'}}>Next</div>
    </div>
  </div>
  <div data-layer="Rectangle 234" className="Rectangle234" style={{width: 1392, height: 31, left: 319, top: 218, position: 'absolute', background: 'rgba(254, 222, 242, 0.30)', borderRadius: 40}} />
  <div data-layer="Rectangle 181" className="Rectangle181" style={{width: 3.25, height: 3.02, left: 352.10, top: 232.61, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 3.25, height: 3.02, left: 349.08, top: 229.35, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 3.25, height: 3.02, left: 349.08, top: 232.61, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 3.25, height: 3.02, left: 349.08, top: 235.86, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 4.96, height: 3.02, left: 346.06, top: 226.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 4.96, height: 3.02, left: 346.06, top: 231.52, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 4.96, height: 3.02, left: 346.06, top: 236.48, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 4.96, height: 3.02, left: 343.04, top: 226.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 4.96, height: 3.02, left: 343.04, top: 231.52, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 4.96, height: 3.02, left: 343.04, top: 236.48, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 6.89, height: 3.02, left: 340.01, top: 223.54, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 6.89, height: 3.02, left: 340.01, top: 230.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 6.89, height: 3.02, left: 340.01, top: 237.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 6.89, height: 3.02, left: 338.39, top: 223.54, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 6.89, height: 3.02, left: 338.39, top: 230.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 6.89, height: 3.02, left: 338.39, top: 237.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 8.75, height: 3.02, left: 335.37, top: 220.75, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 8.75, height: 3.02, left: 335.37, top: 229.51, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 8.75, height: 3.02, left: 335.37, top: 238.26, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 8.75, height: 7.67, left: 332.34, top: 220.75, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 8.75, height: 7.67, left: 332.34, top: 229.51, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 8.75, height: 7.67, left: 332.34, top: 238.26, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 185" className="Rectangle185" style={{width: 8.75, height: 7.67, left: 332.34, top: 238.26, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 4.11, height: 2.56, left: 324.68, top: 217.27, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 4.11, height: 2.56, left: 324.68, top: 221.37, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 4.11, height: 2.56, left: 324.68, top: 225.48, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 1.16, height: 3.25, left: 327.93, top: 217.27, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 1.16, height: 3.25, left: 327.93, top: 218.43, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 1.16, height: 3.25, left: 327.93, top: 219.59, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 3.10, height: 3.72, left: 322.12, top: 217.27, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 3.10, height: 3.72, left: 322.12, top: 220.37, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 3.10, height: 3.72, left: 322.12, top: 223.46, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 3.10, height: 3.72, left: 324.68, top: 229.58, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 3.10, height: 3.72, left: 324.68, top: 232.68, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 3.10, height: 3.72, left: 324.68, top: 235.78, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 3.25, height: 13.71, left: 318.63, top: 231.91, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#266EA9'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 3.25, height: 13.71, left: 318.63, top: 235.16, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#266EA9'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 3.25, height: 13.71, left: 318.63, top: 238.42, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#266EA9'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 5.81, height: 8.50, left: 315.05, top: 226.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#266EA9'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 7.90, height: 8.50, left: 320.96, top: 226.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#266EA9'}} />
  <div data-layer="Rectangle 186" className="Rectangle186" style={{width: 3.49, height: 3.31, left: 315.05, top: 228.89, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#C9C5A3'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 5.11, height: 8.50, left: 320.96, top: 233.77, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#266EA9'}} />
  <div data-layer="Rectangle 185" className="Rectangle185" style={{width: 3.49, height: 3.31, left: 318.36, top: 232.14, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FAFAF8'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 1.01, height: 10.69, left: 318.40, top: 223.54, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 1.01, height: 10.69, left: 318.40, top: 224.55, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 1.01, height: 10.69, left: 318.40, top: 225.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 1.39, height: 5.35, left: 310.04, top: 226.10, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 0.93, height: 5.35, left: 310.04, top: 227.49, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 0.93, height: 5.35, left: 310.04, top: 228.42, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 0.93, height: 3.72, left: 322.12, top: 238.88, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 0.93, height: 3.72, left: 322.12, top: 239.81, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 0.93, height: 3.72, left: 322.12, top: 240.74, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 0.93, height: 10.69, left: 318.40, top: 241.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 0.93, height: 10.69, left: 318.40, top: 242.60, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 0.93, height: 10.69, left: 318.40, top: 243.53, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 1.08, height: 5.35, left: 310.04, top: 238.88, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 1.08, height: 5.35, left: 310.04, top: 239.96, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 1.08, height: 5.35, left: 310.04, top: 241.05, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 3.18, height: 5.58, left: 307.25, top: 229.35, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 3.18, height: 5.58, left: 307.25, top: 232.53, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 3.18, height: 5.58, left: 307.25, top: 235.70, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 2.87, height: 23.47, left: 318.40, top: 214.94, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 2.87, height: 23.47, left: 318.40, top: 217.81, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 2.87, height: 23.47, left: 318.40, top: 220.68, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 2.87, height: 24.40, left: 307.71, top: 217.73, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 2.87, height: 24.40, left: 307.71, top: 220.60, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 2.87, height: 24.40, left: 307.71, top: 223.46, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 2.79, height: 29.28, left: 304.69, top: 220.99, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 2.79, height: 29.28, left: 304.69, top: 223.77, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 2.79, height: 29.28, left: 304.69, top: 226.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 185" className="Rectangle185" style={{width: 9.53, height: 16.73, left: 292.14, top: 229.35, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 186" className="Rectangle186" style={{width: 9.06, height: 16.27, left: 295.86, top: 229.82, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 187" className="Rectangle187" style={{width: 2.79, height: 16.27, left: 294.93, top: 214.94, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 215" className="Rectangle215" style={{width: 2.79, height: 19.52, left: 283.54, top: 201, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 229" className="Rectangle229" style={{width: 2.79, height: 19.29, left: 283.31, top: 264.21, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 216" className="Rectangle216" style={{width: 38.11, height: 3.02, left: 275.41, top: 214.94, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 217" className="Rectangle217" style={{width: 2.79, height: 3.02, left: 272.39, top: 212.15, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 225" className="Rectangle225" style={{width: 2.79, height: 3.02, left: 272.39, top: 253.06, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 226" className="Rectangle226" style={{width: 2.79, height: 5.35, left: 269.37, top: 255.84, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 227" className="Rectangle227" style={{width: 2.79, height: 5.35, left: 266.58, top: 258.63, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 228" className="Rectangle228" style={{width: 5.58, height: 2.79, left: 264.02, top: 261.42, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 218" className="Rectangle218" style={{width: 2.79, height: 3.02, left: 269.37, top: 209.37, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 219" className="Rectangle219" style={{width: 5.58, height: 2.79, left: 266.81, top: 206.58, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 220" className="Rectangle220" style={{width: 8.37, height: 3.02, left: 264.02, top: 201, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 221" className="Rectangle221" style={{width: 2.79, height: 3.49, left: 286.80, top: 203.79, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 230" className="Rectangle230" style={{width: 2.79, height: 3.49, left: 286.80, top: 261.42, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 231" className="Rectangle231" style={{width: 2.79, height: 2.32, left: 289.12, top: 258.63, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 232" className="Rectangle232" style={{width: 2.79, height: 2.56, left: 291.68, top: 255.84, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 233" className="Rectangle233" style={{width: 2.56, height: 2.56, left: 294.23, top: 253.29, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 222" className="Rectangle222" style={{width: 2.79, height: 2.32, left: 289.12, top: 206.58, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 223" className="Rectangle223" style={{width: 2.79, height: 2.56, left: 291.68, top: 209.37, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 224" className="Rectangle224" style={{width: 2.79, height: 3.49, left: 294.93, top: 212.15, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 214" className="Rectangle214" style={{width: 3.25, height: 16.50, left: 297.02, top: 250.27, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 188" className="Rectangle188" style={{width: 2.79, height: 8.37, left: 291.68, top: 212.15, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FDC13B'}} />
  <div data-layer="Rectangle 190" className="Rectangle190" style={{width: 2.79, height: 8.37, left: 289.12, top: 209.37, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FDC13B'}} />
  <div data-layer="Rectangle 191" className="Rectangle191" style={{width: 2.79, height: 8.37, left: 286.80, top: 206.58, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FDC13B'}} />
  <div data-layer="Rectangle 193" className="Rectangle193" style={{width: 2.79, height: 8.37, left: 283.31, top: 212.15, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 194" className="Rectangle194" style={{width: 2.79, height: 8.37, left: 280.75, top: 209.37, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 195" className="Rectangle195" style={{width: 2.79, height: 8.37, left: 278.43, top: 206.58, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 196" className="Rectangle196" style={{width: 2.79, height: 3.49, left: 272.85, top: 209.37, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 199" className="Rectangle199" style={{width: 2.79, height: 3.49, left: 275.87, top: 212.15, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 200" className="Rectangle200" style={{width: 2.79, height: 3.49, left: 278.89, top: 214.94, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 197" className="Rectangle197" style={{width: 2.79, height: 3.49, left: 270.06, top: 206.58, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 198" className="Rectangle198" style={{width: 2.79, height: 2.56, left: 266.58, top: 203.79, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 192" className="Rectangle192" style={{width: 2.79, height: 16.73, left: 283.31, top: 203.79, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FDC13B'}} />
  <div data-layer="Rectangle 189" className="Rectangle189" style={{width: 3.25, height: 7.90, left: 275.41, top: 220.99, position: 'absolute', transform: 'rotate(270deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 201" className="Rectangle201" style={{width: 2.32, height: 8.37, left: 283.31, top: 255.84, position: 'absolute', transform: 'rotate(270deg)', transformOrigin: 'top left', background: '#FDC13B'}} />
  <div data-layer="Rectangle 202" className="Rectangle202" style={{width: 2.79, height: 8.37, left: 280.75, top: 258.63, position: 'absolute', transform: 'rotate(270deg)', transformOrigin: 'top left', background: '#FDC13B'}} />
  <div data-layer="Rectangle 203" className="Rectangle203" style={{width: 2.79, height: 8.37, left: 278.43, top: 261.42, position: 'absolute', transform: 'rotate(270deg)', transformOrigin: 'top left', background: '#FDC13B'}} />
  <div data-layer="Rectangle 204" className="Rectangle204" style={{width: 2.32, height: 8.37, left: 274.94, top: 255.84, position: 'absolute', transform: 'rotate(270deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 205" className="Rectangle205" style={{width: 2.79, height: 8.37, left: 272.39, top: 258.63, position: 'absolute', transform: 'rotate(270deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 206" className="Rectangle206" style={{width: 2.79, height: 8.37, left: 270.06, top: 261.42, position: 'absolute', transform: 'rotate(270deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 207" className="Rectangle207" style={{width: 2.79, height: 3.49, left: 269.37, top: 258.63, position: 'absolute', transform: 'rotate(270deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 208" className="Rectangle208" style={{width: 2.79, height: 3.49, left: 272.39, top: 255.84, position: 'absolute', transform: 'rotate(270deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 209" className="Rectangle209" style={{width: 3.25, height: 5.11, left: 275.41, top: 253.52, position: 'absolute', transform: 'rotate(270deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 210" className="Rectangle210" style={{width: 2.79, height: 3.49, left: 266.58, top: 261.42, position: 'absolute', transform: 'rotate(270deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 211" className="Rectangle211" style={{width: 2.79, height: 2.56, left: 264.02, top: 264.21, position: 'absolute', transform: 'rotate(270deg)', transformOrigin: 'top left', background: '#E16B20'}} />
  <div data-layer="Rectangle 212" className="Rectangle212" style={{width: 2.79, height: 16.73, left: 266.58, top: 264.21, position: 'absolute', transform: 'rotate(270deg)', transformOrigin: 'top left', background: '#FDC13B'}} />
  <div data-layer="Rectangle 213" className="Rectangle213" style={{width: 2.79, height: 7.90, left: 283.31, top: 247.48, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#1F182F'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 3.25, height: 9.53, left: 301.67, top: 229.12, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 3.25, height: 6.74, left: 301.67, top: 232.37, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 3.25, height: 9.53, left: 301.67, top: 235.63, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 2.56, height: 25.80, left: 324.68, top: 244.46, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 187" className="Rectangle187" style={{width: 3.72, height: 30.91, left: 327.93, top: 247.01, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E2751E'}} />
  <div data-layer="Rectangle 190" className="Rectangle190" style={{width: 4.88, height: 15.57, left: 298.88, top: 245.39, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E2751E'}} />
  <div data-layer="Rectangle 191" className="Rectangle191" style={{width: 8.60, height: 13.25, left: 288.66, top: 238.88, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E2751E'}} />
  <div data-layer="Rectangle 188" className="Rectangle188" style={{width: 3.72, height: 20.68, left: 317.70, top: 249.80, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E2751E'}} />
  <div data-layer="Rectangle 189" className="Rectangle189" style={{width: 3.72, height: 20.68, left: 317.70, top: 249.80, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E2751E'}} />
  <div data-layer="Rectangle 185" className="Rectangle185" style={{width: 2.79, height: 6.27, left: 324.68, top: 241.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 186" className="Rectangle186" style={{width: 2.79, height: 3.72, left: 324.68, top: 238.88, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 3.25, height: 21.38, left: 307.71, top: 242.13, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 3.25, height: 16.04, left: 304.69, top: 238.88, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#E99A20'}} />
  <div data-layer="Rectangle 182" className="Rectangle182" style={{width: 1.01, height: 3.72, left: 322.12, top: 226.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 183" className="Rectangle183" style={{width: 1.01, height: 3.72, left: 322.12, top: 227.57, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 184" className="Rectangle184" style={{width: 1.01, height: 3.72, left: 322.12, top: 228.58, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#161934'}} />
  <div data-layer="Rectangle 138" className="Rectangle138" style={{width: 3.33, height: 16.67, left: 754.66, top: 226.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 151" className="Rectangle151" style={{width: 3.33, height: 10, left: 754.66, top: 223.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 177" className="Rectangle177" style={{width: 3.33, height: 16.67, left: 777.99, top: 230, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 178" className="Rectangle178" style={{width: 10, height: 16.67, left: 777.99, top: 233.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 168" className="Rectangle168" style={{width: 19.82, height: 3.51, left: 761.33, top: 230, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 169" className="Rectangle169" style={{width: 6.49, height: 3.33, left: 764.66, top: 243.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 172" className="Rectangle172" style={{width: 3.33, height: 10, left: 781.33, top: 233.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 174" className="Rectangle174" style={{width: 3.33, height: 10, left: 777.99, top: 236.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 175" className="Rectangle175" style={{width: 3.33, height: 10, left: 774.66, top: 240, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 176" className="Rectangle176" style={{width: 3.33, height: 6.67, left: 771.33, top: 243.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 173" className="Rectangle173" style={{width: 3.33, height: 6.67, left: 784.66, top: 230, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 152" className="Rectangle152" style={{width: 3.33, height: 10, left: 757.99, top: 220, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 153" className="Rectangle153" style={{width: 3.33, height: 3.33, left: 754.66, top: 216.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 139" className="Rectangle139" style={{width: 20, height: 3.33, left: 757.99, top: 210, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 147" className="Rectangle147" style={{width: 10, height: 6.67, left: 768, top: 206.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 148" className="Rectangle148" style={{width: 10, height: 6.67, left: 774.66, top: 213.51, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 149" className="Rectangle149" style={{width: 6.67, height: 6.67, left: 781.33, top: 220, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 162" className="Rectangle162" style={{width: 10, height: 6.67, left: 748, top: 253.33, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 163" className="Rectangle163" style={{width: 10, height: 6.67, left: 741.33, top: 246.49, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 164" className="Rectangle164" style={{width: 6.67, height: 6.67, left: 734.66, top: 240, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 97" className="Rectangle97" style={{width: 6.67, height: 3.33, left: 754.66, top: 200, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 122" className="Rectangle122" style={{width: 6.67, height: 3.33, left: 754.66, top: 256.67, position: 'absolute', background: '#50162B'}} />
  <div data-layer="Rectangle 105" className="Rectangle105" style={{width: 6.67, height: 3.33, left: 731.33, top: 226.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#874A5E'}} />
  <div data-layer="Rectangle 130" className="Rectangle130" style={{width: 6.67, height: 3.33, left: 734.66, top: 226.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 131" className="Rectangle131" style={{width: 10, height: 3.33, left: 737.99, top: 223.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 150" className="Rectangle150" style={{width: 6.67, height: 3.33, left: 761.33, top: 223.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 154" className="Rectangle154" style={{width: 3.33, height: 3.33, left: 764.66, top: 226.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 156" className="Rectangle156" style={{width: 6.67, height: 3.33, left: 754.66, top: 236.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 157" className="Rectangle157" style={{width: 3.33, height: 3.33, left: 751.33, top: 233.33, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 155" className="Rectangle155" style={{width: 3.33, height: 10, left: 784.66, top: 226.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 165" className="Rectangle165" style={{width: 3.33, height: 10, left: 757.99, top: 256.49, position: 'absolute', transform: 'rotate(-180deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 140" className="Rectangle140" style={{width: 10, height: 3.33, left: 761.33, top: 203.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 141" className="Rectangle141" style={{width: 6.67, height: 3.33, left: 757.99, top: 203.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 142" className="Rectangle142" style={{width: 6.84, height: 3.33, left: 754.66, top: 206.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 132" className="Rectangle132" style={{width: 3.33, height: 3.33, left: 741.33, top: 230, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 133" className="Rectangle133" style={{width: 6.67, height: 3.33, left: 741.33, top: 220, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 134" className="Rectangle134" style={{width: 10, height: 3.33, left: 744.66, top: 216.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 135" className="Rectangle135" style={{width: 10, height: 3.33, left: 748, top: 213.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 136" className="Rectangle136" style={{width: 10, height: 3.33, left: 751.33, top: 210, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 137" className="Rectangle137" style={{width: 6.67, height: 3.33, left: 754.66, top: 210, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 143" className="Rectangle143" style={{width: 10, height: 6.67, left: 764.66, top: 213.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 144" className="Rectangle144" style={{width: 6.67, height: 6.67, left: 768, top: 216.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 145" className="Rectangle145" style={{width: 6.67, height: 10, left: 771.33, top: 220, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 146" className="Rectangle146" style={{width: 6.67, height: 10, left: 774.66, top: 223.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 158" className="Rectangle158" style={{width: 10, height: 6.67, left: 751.33, top: 246.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#F43E64'}} />
  <div data-layer="Rectangle 159" className="Rectangle159" style={{width: 6.67, height: 6.67, left: 748, top: 243.33, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#F43E64'}} />
  <div data-layer="Rectangle 166" className="Rectangle166" style={{width: 6.67, height: 6.67, left: 757.99, top: 256.49, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#D0012D'}} />
  <div data-layer="Rectangle 167" className="Rectangle167" style={{width: 3.33, height: 3.33, left: 764.66, top: 250, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#D0012D'}} />
  <div data-layer="Rectangle 160" className="Rectangle160" style={{width: 6.67, height: 10, left: 744.66, top: 240, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#F43E64'}} />
  <div data-layer="Rectangle 161" className="Rectangle161" style={{width: 6.67, height: 10, left: 741.33, top: 236.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#F43E64'}} />
  <div data-layer="Rectangle 98" className="Rectangle98" style={{width: 3.33, height: 3.33, left: 751.33, top: 203.33, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 99" className="Rectangle99" style={{width: 3.33, height: 3.33, left: 748, top: 206.67, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 100" className="Rectangle100" style={{width: 3.33, height: 3.33, left: 744.66, top: 210, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 101" className="Rectangle101" style={{width: 3.33, height: 3.33, left: 741.33, top: 213.33, position: 'absolute', background: '#4F1F32'}} />
  <div data-layer="Rectangle 102" className="Rectangle102" style={{width: 3.33, height: 3.33, left: 737.99, top: 216.67, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 103" className="Rectangle103" style={{width: 3.33, height: 3.33, left: 734.66, top: 220, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 104" className="Rectangle104" style={{width: 3.33, height: 3.33, left: 731.33, top: 223.33, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 107" className="Rectangle107" style={{width: 6.67, height: 3.33, left: 787.99, top: 226.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 108" className="Rectangle108" style={{width: 3.33, height: 3.33, left: 764.66, top: 206.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 109" className="Rectangle109" style={{width: 3.33, height: 3.33, left: 768, top: 210, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 110" className="Rectangle110" style={{width: 3.33, height: 3.33, left: 771.33, top: 213.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 111" className="Rectangle111" style={{width: 3.33, height: 3.33, left: 774.66, top: 216.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 112" className="Rectangle112" style={{width: 3.33, height: 3.33, left: 777.99, top: 220, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 113" className="Rectangle113" style={{width: 3.33, height: 3.33, left: 781.33, top: 223.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 114" className="Rectangle114" style={{width: 3.33, height: 3.33, left: 784.66, top: 226.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 115" className="Rectangle115" style={{width: 3.33, height: 3.33, left: 781.33, top: 233.33, position: 'absolute', background: '#561A2D'}} />
  <div data-layer="Rectangle 116" className="Rectangle116" style={{width: 3.33, height: 3.33, left: 777.99, top: 236.67, position: 'absolute', background: '#561A2D'}} />
  <div data-layer="Rectangle 117" className="Rectangle117" style={{width: 3.33, height: 3.33, left: 774.66, top: 240, position: 'absolute', background: '#561A2D'}} />
  <div data-layer="Rectangle 118" className="Rectangle118" style={{width: 3.33, height: 3.33, left: 771.33, top: 243.33, position: 'absolute', background: '#561A2D'}} />
  <div data-layer="Rectangle 119" className="Rectangle119" style={{width: 3.33, height: 3.33, left: 768, top: 246.67, position: 'absolute', background: '#54172D'}} />
  <div data-layer="Rectangle 120" className="Rectangle120" style={{width: 3.33, height: 3.33, left: 764.66, top: 250, position: 'absolute', background: '#561A2D'}} />
  <div data-layer="Rectangle 121" className="Rectangle121" style={{width: 3.33, height: 3.33, left: 761.33, top: 253.33, position: 'absolute', background: '#54172D'}} />
  <div data-layer="Rectangle 123" className="Rectangle123" style={{width: 3.33, height: 3.33, left: 734.66, top: 236.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#874A5E'}} />
  <div data-layer="Rectangle 124" className="Rectangle124" style={{width: 3.33, height: 3.33, left: 737.99, top: 240, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 125" className="Rectangle125" style={{width: 3.33, height: 3.33, left: 741.33, top: 243.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 126" className="Rectangle126" style={{width: 3.33, height: 3.33, left: 744.66, top: 246.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 127" className="Rectangle127" style={{width: 3.33, height: 3.33, left: 748, top: 250, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 128" className="Rectangle128" style={{width: 3.33, height: 3.33, left: 751.33, top: 253.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 129" className="Rectangle129" style={{width: 3.33, height: 3.33, left: 754.66, top: 256.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 138" className="Rectangle138" style={{width: 3.33, height: 16.67, left: 1179.67, top: 225.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 151" className="Rectangle151" style={{width: 3.33, height: 10, left: 1179.67, top: 222.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 177" className="Rectangle177" style={{width: 3.33, height: 16.67, left: 1203, top: 229, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 178" className="Rectangle178" style={{width: 10, height: 16.67, left: 1203, top: 232.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 168" className="Rectangle168" style={{width: 19.82, height: 3.51, left: 1186.33, top: 229, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 169" className="Rectangle169" style={{width: 6.49, height: 3.33, left: 1189.67, top: 242.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 172" className="Rectangle172" style={{width: 3.33, height: 10, left: 1206.33, top: 232.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 174" className="Rectangle174" style={{width: 3.33, height: 10, left: 1203, top: 235.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 175" className="Rectangle175" style={{width: 3.33, height: 10, left: 1199.67, top: 239, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 176" className="Rectangle176" style={{width: 3.33, height: 6.67, left: 1196.33, top: 242.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 173" className="Rectangle173" style={{width: 3.33, height: 6.67, left: 1209.67, top: 229, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 152" className="Rectangle152" style={{width: 3.33, height: 10, left: 1183, top: 219, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 153" className="Rectangle153" style={{width: 3.33, height: 3.33, left: 1179.67, top: 215.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 139" className="Rectangle139" style={{width: 20, height: 3.33, left: 1183, top: 209, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 147" className="Rectangle147" style={{width: 10, height: 6.67, left: 1193, top: 205.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 148" className="Rectangle148" style={{width: 10, height: 6.67, left: 1199.67, top: 212.51, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 149" className="Rectangle149" style={{width: 6.67, height: 6.67, left: 1206.33, top: 219, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 162" className="Rectangle162" style={{width: 10, height: 6.67, left: 1173, top: 252.33, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 163" className="Rectangle163" style={{width: 10, height: 6.67, left: 1166.33, top: 245.49, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 164" className="Rectangle164" style={{width: 6.67, height: 6.67, left: 1159.67, top: 239, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 97" className="Rectangle97" style={{width: 6.67, height: 3.33, left: 1179.67, top: 199, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 122" className="Rectangle122" style={{width: 6.67, height: 3.33, left: 1179.67, top: 255.67, position: 'absolute', background: '#50162B'}} />
  <div data-layer="Rectangle 105" className="Rectangle105" style={{width: 6.67, height: 3.33, left: 1156.33, top: 225.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#874A5E'}} />
  <div data-layer="Rectangle 130" className="Rectangle130" style={{width: 6.67, height: 3.33, left: 1159.67, top: 225.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 131" className="Rectangle131" style={{width: 10, height: 3.33, left: 1163, top: 222.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 150" className="Rectangle150" style={{width: 6.67, height: 3.33, left: 1186.33, top: 222.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 154" className="Rectangle154" style={{width: 3.33, height: 3.33, left: 1189.67, top: 225.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 156" className="Rectangle156" style={{width: 6.67, height: 3.33, left: 1179.67, top: 235.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 157" className="Rectangle157" style={{width: 3.33, height: 3.33, left: 1176.33, top: 232.33, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 155" className="Rectangle155" style={{width: 3.33, height: 10, left: 1209.67, top: 225.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 165" className="Rectangle165" style={{width: 3.33, height: 10, left: 1183, top: 255.49, position: 'absolute', transform: 'rotate(-180deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 140" className="Rectangle140" style={{width: 10, height: 3.33, left: 1186.33, top: 202.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 141" className="Rectangle141" style={{width: 6.67, height: 3.33, left: 1183, top: 202.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 142" className="Rectangle142" style={{width: 6.84, height: 3.33, left: 1179.67, top: 205.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 132" className="Rectangle132" style={{width: 3.33, height: 3.33, left: 1166.33, top: 229, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 133" className="Rectangle133" style={{width: 6.67, height: 3.33, left: 1166.33, top: 219, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 134" className="Rectangle134" style={{width: 10, height: 3.33, left: 1169.67, top: 215.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 135" className="Rectangle135" style={{width: 10, height: 3.33, left: 1173, top: 212.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 136" className="Rectangle136" style={{width: 10, height: 3.33, left: 1176.33, top: 209, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 137" className="Rectangle137" style={{width: 6.67, height: 3.33, left: 1179.67, top: 209, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 143" className="Rectangle143" style={{width: 10, height: 6.67, left: 1189.67, top: 212.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 144" className="Rectangle144" style={{width: 6.67, height: 6.67, left: 1193, top: 215.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 145" className="Rectangle145" style={{width: 6.67, height: 10, left: 1196.33, top: 219, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 146" className="Rectangle146" style={{width: 6.67, height: 10, left: 1199.67, top: 222.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 158" className="Rectangle158" style={{width: 10, height: 6.67, left: 1176.33, top: 245.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#F43E64'}} />
  <div data-layer="Rectangle 159" className="Rectangle159" style={{width: 6.67, height: 6.67, left: 1173, top: 242.33, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#F43E64'}} />
  <div data-layer="Rectangle 166" className="Rectangle166" style={{width: 6.67, height: 6.67, left: 1183, top: 255.49, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#D0012D'}} />
  <div data-layer="Rectangle 167" className="Rectangle167" style={{width: 3.33, height: 3.33, left: 1189.67, top: 249, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#D0012D'}} />
  <div data-layer="Rectangle 160" className="Rectangle160" style={{width: 6.67, height: 10, left: 1169.67, top: 239, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#F43E64'}} />
  <div data-layer="Rectangle 161" className="Rectangle161" style={{width: 6.67, height: 10, left: 1166.33, top: 235.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#F43E64'}} />
  <div data-layer="Rectangle 98" className="Rectangle98" style={{width: 3.33, height: 3.33, left: 1176.33, top: 202.33, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 99" className="Rectangle99" style={{width: 3.33, height: 3.33, left: 1173, top: 205.67, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 100" className="Rectangle100" style={{width: 3.33, height: 3.33, left: 1169.67, top: 209, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 101" className="Rectangle101" style={{width: 3.33, height: 3.33, left: 1166.33, top: 212.33, position: 'absolute', background: '#4F1F32'}} />
  <div data-layer="Rectangle 102" className="Rectangle102" style={{width: 3.33, height: 3.33, left: 1163, top: 215.67, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 103" className="Rectangle103" style={{width: 3.33, height: 3.33, left: 1159.67, top: 219, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 104" className="Rectangle104" style={{width: 3.33, height: 3.33, left: 1156.33, top: 222.33, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 107" className="Rectangle107" style={{width: 6.67, height: 3.33, left: 1213, top: 225.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 108" className="Rectangle108" style={{width: 3.33, height: 3.33, left: 1189.67, top: 205.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 109" className="Rectangle109" style={{width: 3.33, height: 3.33, left: 1193, top: 209, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 110" className="Rectangle110" style={{width: 3.33, height: 3.33, left: 1196.33, top: 212.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 111" className="Rectangle111" style={{width: 3.33, height: 3.33, left: 1199.67, top: 215.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 112" className="Rectangle112" style={{width: 3.33, height: 3.33, left: 1203, top: 219, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 113" className="Rectangle113" style={{width: 3.33, height: 3.33, left: 1206.33, top: 222.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 114" className="Rectangle114" style={{width: 3.33, height: 3.33, left: 1209.67, top: 225.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 115" className="Rectangle115" style={{width: 3.33, height: 3.33, left: 1206.33, top: 232.33, position: 'absolute', background: '#561A2D'}} />
  <div data-layer="Rectangle 116" className="Rectangle116" style={{width: 3.33, height: 3.33, left: 1203, top: 235.67, position: 'absolute', background: '#561A2D'}} />
  <div data-layer="Rectangle 117" className="Rectangle117" style={{width: 3.33, height: 3.33, left: 1199.67, top: 239, position: 'absolute', background: '#561A2D'}} />
  <div data-layer="Rectangle 118" className="Rectangle118" style={{width: 3.33, height: 3.33, left: 1196.33, top: 242.33, position: 'absolute', background: '#561A2D'}} />
  <div data-layer="Rectangle 119" className="Rectangle119" style={{width: 3.33, height: 3.33, left: 1193, top: 245.67, position: 'absolute', background: '#54172D'}} />
  <div data-layer="Rectangle 120" className="Rectangle120" style={{width: 3.33, height: 3.33, left: 1189.67, top: 249, position: 'absolute', background: '#561A2D'}} />
  <div data-layer="Rectangle 121" className="Rectangle121" style={{width: 3.33, height: 3.33, left: 1186.33, top: 252.33, position: 'absolute', background: '#54172D'}} />
  <div data-layer="Rectangle 123" className="Rectangle123" style={{width: 3.33, height: 3.33, left: 1159.67, top: 235.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#874A5E'}} />
  <div data-layer="Rectangle 124" className="Rectangle124" style={{width: 3.33, height: 3.33, left: 1163, top: 239, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 125" className="Rectangle125" style={{width: 3.33, height: 3.33, left: 1166.33, top: 242.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 126" className="Rectangle126" style={{width: 3.33, height: 3.33, left: 1169.67, top: 245.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 127" className="Rectangle127" style={{width: 3.33, height: 3.33, left: 1173, top: 249, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 128" className="Rectangle128" style={{width: 3.33, height: 3.33, left: 1176.33, top: 252.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 129" className="Rectangle129" style={{width: 3.33, height: 3.33, left: 1179.67, top: 255.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 138" className="Rectangle138" style={{width: 3.56, height: 17.78, left: 754.44, top: 227.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 151" className="Rectangle151" style={{width: 3.56, height: 10.67, left: 754.44, top: 223.89, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 177" className="Rectangle177" style={{width: 3.56, height: 17.78, left: 779.33, top: 231, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 178" className="Rectangle178" style={{width: 10.67, height: 17.78, left: 779.33, top: 234.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 168" className="Rectangle168" style={{width: 21.15, height: 3.74, left: 761.56, top: 231, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 169" className="Rectangle169" style={{width: 6.92, height: 3.56, left: 765.11, top: 245.22, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 172" className="Rectangle172" style={{width: 3.56, height: 10.67, left: 782.89, top: 234.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 174" className="Rectangle174" style={{width: 3.56, height: 10.67, left: 779.33, top: 238.11, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 175" className="Rectangle175" style={{width: 3.56, height: 10.67, left: 775.78, top: 241.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 176" className="Rectangle176" style={{width: 3.56, height: 7.11, left: 772.22, top: 245.22, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 173" className="Rectangle173" style={{width: 3.56, height: 7.11, left: 786.44, top: 231, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 152" className="Rectangle152" style={{width: 3.56, height: 10.67, left: 758, top: 220.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 153" className="Rectangle153" style={{width: 3.56, height: 3.56, left: 754.44, top: 216.78, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 139" className="Rectangle139" style={{width: 21.33, height: 3.56, left: 758, top: 209.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 147" className="Rectangle147" style={{width: 10.67, height: 7.11, left: 768.67, top: 206.11, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 148" className="Rectangle148" style={{width: 10.78, height: 4.45, left: 772.21, top: 213.15, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 179" className="Rectangle179" style={{width: 10.78, height: 4.45, left: 775.85, top: 216.79, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 149" className="Rectangle149" style={{width: 7.11, height: 7.11, left: 782.89, top: 220.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 162" className="Rectangle162" style={{width: 10.67, height: 7.11, left: 747.33, top: 255.89, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 163" className="Rectangle163" style={{width: 10.67, height: 7.11, left: 740.22, top: 248.59, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 164" className="Rectangle164" style={{width: 7.11, height: 7.11, left: 733.11, top: 241.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 97" className="Rectangle97" style={{width: 7.11, height: 3.56, left: 754.44, top: 199, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 122" className="Rectangle122" style={{width: 7.11, height: 3.56, left: 754.44, top: 259.44, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 105" className="Rectangle105" style={{width: 7.11, height: 3.56, left: 729.56, top: 227.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 130" className="Rectangle130" style={{width: 7.11, height: 3.56, left: 733.11, top: 227.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 131" className="Rectangle131" style={{width: 10.67, height: 3.56, left: 736.67, top: 223.89, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 150" className="Rectangle150" style={{width: 7.11, height: 3.56, left: 761.56, top: 223.89, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 154" className="Rectangle154" style={{width: 3.56, height: 3.56, left: 765.11, top: 227.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 156" className="Rectangle156" style={{width: 7.11, height: 3.56, left: 754.44, top: 238.11, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 157" className="Rectangle157" style={{width: 3.56, height: 3.56, left: 750.89, top: 234.56, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 155" className="Rectangle155" style={{width: 3.56, height: 10.67, left: 786.44, top: 227.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 165" className="Rectangle165" style={{width: 3.56, height: 10.67, left: 758, top: 259.26, position: 'absolute', transform: 'rotate(-180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 140" className="Rectangle140" style={{width: 10.67, height: 3.56, left: 761.56, top: 202.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 141" className="Rectangle141" style={{width: 7.11, height: 3.56, left: 758, top: 202.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 142" className="Rectangle142" style={{width: 7.30, height: 3.56, left: 754.44, top: 206.11, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 132" className="Rectangle132" style={{width: 3.56, height: 3.56, left: 740.22, top: 231, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 133" className="Rectangle133" style={{width: 7.11, height: 3.56, left: 740.22, top: 220.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 134" className="Rectangle134" style={{width: 10.67, height: 3.56, left: 743.78, top: 216.78, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 135" className="Rectangle135" style={{width: 10.67, height: 3.56, left: 747.33, top: 213.22, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 136" className="Rectangle136" style={{width: 10.67, height: 3.56, left: 750.89, top: 209.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 137" className="Rectangle137" style={{width: 7.11, height: 3.56, left: 754.44, top: 209.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 143" className="Rectangle143" style={{width: 10.67, height: 7.11, left: 765.11, top: 213.22, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 144" className="Rectangle144" style={{width: 7.11, height: 7.11, left: 768.67, top: 216.78, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 145" className="Rectangle145" style={{width: 7.11, height: 10.67, left: 772.22, top: 220.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 146" className="Rectangle146" style={{width: 7.11, height: 10.67, left: 775.78, top: 223.89, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 158" className="Rectangle158" style={{width: 10.67, height: 7.11, left: 750.89, top: 248.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 159" className="Rectangle159" style={{width: 7.11, height: 7.11, left: 747.33, top: 245.22, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 166" className="Rectangle166" style={{width: 7.11, height: 7.11, left: 758, top: 259.26, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 167" className="Rectangle167" style={{width: 3.56, height: 3.56, left: 765.11, top: 252.33, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 160" className="Rectangle160" style={{width: 7.11, height: 10.67, left: 743.78, top: 241.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 161" className="Rectangle161" style={{width: 7.11, height: 10.67, left: 740.22, top: 238.11, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 98" className="Rectangle98" style={{width: 3.56, height: 3.56, left: 750.89, top: 202.56, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 99" className="Rectangle99" style={{width: 3.56, height: 3.56, left: 747.33, top: 206.11, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 100" className="Rectangle100" style={{width: 3.56, height: 3.56, left: 743.78, top: 209.67, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 101" className="Rectangle101" style={{width: 3.56, height: 3.56, left: 740.22, top: 213.22, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 102" className="Rectangle102" style={{width: 3.56, height: 3.56, left: 736.67, top: 216.78, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 103" className="Rectangle103" style={{width: 3.56, height: 3.56, left: 733.11, top: 220.33, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 104" className="Rectangle104" style={{width: 3.56, height: 3.56, left: 729.56, top: 223.89, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 107" className="Rectangle107" style={{width: 7.11, height: 3.56, left: 790, top: 227.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 108" className="Rectangle108" style={{width: 3.56, height: 3.56, left: 765.11, top: 206.11, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 109" className="Rectangle109" style={{width: 3.56, height: 3.56, left: 768.67, top: 209.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 110" className="Rectangle110" style={{width: 3.56, height: 3.56, left: 772.22, top: 213.22, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 111" className="Rectangle111" style={{width: 3.64, height: 3.64, left: 775.72, top: 216.92, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 112" className="Rectangle112" style={{width: 3.56, height: 3.56, left: 779.33, top: 220.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 113" className="Rectangle113" style={{width: 3.56, height: 3.56, left: 782.89, top: 223.89, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 114" className="Rectangle114" style={{width: 3.56, height: 3.56, left: 786.44, top: 227.44, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 115" className="Rectangle115" style={{width: 3.56, height: 3.56, left: 782.89, top: 234.56, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 116" className="Rectangle116" style={{width: 3.56, height: 3.56, left: 779.33, top: 238.11, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 117" className="Rectangle117" style={{width: 3.56, height: 3.56, left: 775.78, top: 241.67, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 118" className="Rectangle118" style={{width: 3.56, height: 3.56, left: 772.22, top: 245.22, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 119" className="Rectangle119" style={{width: 3.56, height: 3.56, left: 768.67, top: 248.78, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 120" className="Rectangle120" style={{width: 3.56, height: 3.56, left: 765.11, top: 252.33, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 121" className="Rectangle121" style={{width: 3.56, height: 3.56, left: 761.56, top: 255.89, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 123" className="Rectangle123" style={{width: 3.56, height: 3.56, left: 733.11, top: 238.11, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 124" className="Rectangle124" style={{width: 3.56, height: 3.56, left: 736.67, top: 241.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 125" className="Rectangle125" style={{width: 3.56, height: 3.56, left: 740.22, top: 245.22, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 126" className="Rectangle126" style={{width: 3.56, height: 3.56, left: 743.78, top: 248.78, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 127" className="Rectangle127" style={{width: 3.56, height: 3.56, left: 747.33, top: 252.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 128" className="Rectangle128" style={{width: 3.56, height: 3.56, left: 750.89, top: 255.89, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 129" className="Rectangle129" style={{width: 3.56, height: 3.56, left: 754.44, top: 259.44, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 138" className="Rectangle138" style={{width: 3.56, height: 17.78, left: 1179.44, top: 227.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 151" className="Rectangle151" style={{width: 3.56, height: 10.67, left: 1179.44, top: 223.89, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 177" className="Rectangle177" style={{width: 3.56, height: 17.78, left: 1204.33, top: 231, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 178" className="Rectangle178" style={{width: 10.67, height: 17.78, left: 1204.33, top: 234.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 168" className="Rectangle168" style={{width: 21.15, height: 3.74, left: 1186.56, top: 231, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 169" className="Rectangle169" style={{width: 6.92, height: 3.56, left: 1190.11, top: 245.22, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 172" className="Rectangle172" style={{width: 3.56, height: 10.67, left: 1207.89, top: 234.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 174" className="Rectangle174" style={{width: 3.56, height: 10.67, left: 1204.33, top: 238.11, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 175" className="Rectangle175" style={{width: 3.56, height: 10.67, left: 1200.78, top: 241.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 176" className="Rectangle176" style={{width: 3.56, height: 7.11, left: 1197.22, top: 245.22, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 173" className="Rectangle173" style={{width: 3.56, height: 7.11, left: 1211.44, top: 231, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 152" className="Rectangle152" style={{width: 3.56, height: 10.67, left: 1183, top: 220.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 153" className="Rectangle153" style={{width: 3.56, height: 3.56, left: 1179.44, top: 216.78, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 139" className="Rectangle139" style={{width: 21.33, height: 3.56, left: 1183, top: 209.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 147" className="Rectangle147" style={{width: 10.67, height: 7.11, left: 1193.67, top: 206.11, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 148" className="Rectangle148" style={{width: 10.78, height: 4.45, left: 1197.21, top: 213.15, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 179" className="Rectangle179" style={{width: 10.78, height: 4.45, left: 1200.85, top: 216.79, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 149" className="Rectangle149" style={{width: 7.11, height: 7.11, left: 1207.89, top: 220.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 162" className="Rectangle162" style={{width: 10.67, height: 7.11, left: 1172.33, top: 255.89, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 163" className="Rectangle163" style={{width: 10.67, height: 7.11, left: 1165.22, top: 248.59, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 164" className="Rectangle164" style={{width: 7.11, height: 7.11, left: 1158.11, top: 241.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 97" className="Rectangle97" style={{width: 7.11, height: 3.56, left: 1179.44, top: 199, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 122" className="Rectangle122" style={{width: 7.11, height: 3.56, left: 1179.44, top: 259.44, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 105" className="Rectangle105" style={{width: 7.11, height: 3.56, left: 1154.56, top: 227.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 130" className="Rectangle130" style={{width: 7.11, height: 3.56, left: 1158.11, top: 227.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 131" className="Rectangle131" style={{width: 10.67, height: 3.56, left: 1161.67, top: 223.89, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 150" className="Rectangle150" style={{width: 7.11, height: 3.56, left: 1186.56, top: 223.89, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 154" className="Rectangle154" style={{width: 3.56, height: 3.56, left: 1190.11, top: 227.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 156" className="Rectangle156" style={{width: 7.11, height: 3.56, left: 1179.44, top: 238.11, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 157" className="Rectangle157" style={{width: 3.56, height: 3.56, left: 1175.89, top: 234.56, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 155" className="Rectangle155" style={{width: 3.56, height: 10.67, left: 1211.44, top: 227.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 165" className="Rectangle165" style={{width: 3.56, height: 10.67, left: 1183, top: 259.26, position: 'absolute', transform: 'rotate(-180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 140" className="Rectangle140" style={{width: 10.67, height: 3.56, left: 1186.56, top: 202.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 141" className="Rectangle141" style={{width: 7.11, height: 3.56, left: 1183, top: 202.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 142" className="Rectangle142" style={{width: 7.30, height: 3.56, left: 1179.44, top: 206.11, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 132" className="Rectangle132" style={{width: 3.56, height: 3.56, left: 1165.22, top: 231, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 133" className="Rectangle133" style={{width: 7.11, height: 3.56, left: 1165.22, top: 220.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 134" className="Rectangle134" style={{width: 10.67, height: 3.56, left: 1168.78, top: 216.78, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 135" className="Rectangle135" style={{width: 10.67, height: 3.56, left: 1172.33, top: 213.22, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 136" className="Rectangle136" style={{width: 10.67, height: 3.56, left: 1175.89, top: 209.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 137" className="Rectangle137" style={{width: 7.11, height: 3.56, left: 1179.44, top: 209.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 143" className="Rectangle143" style={{width: 10.67, height: 7.11, left: 1190.11, top: 213.22, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 144" className="Rectangle144" style={{width: 7.11, height: 7.11, left: 1193.67, top: 216.78, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 145" className="Rectangle145" style={{width: 7.11, height: 10.67, left: 1197.22, top: 220.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 146" className="Rectangle146" style={{width: 7.11, height: 10.67, left: 1200.78, top: 223.89, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 158" className="Rectangle158" style={{width: 10.67, height: 7.11, left: 1175.89, top: 248.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 159" className="Rectangle159" style={{width: 7.11, height: 7.11, left: 1172.33, top: 245.22, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 166" className="Rectangle166" style={{width: 7.11, height: 7.11, left: 1183, top: 259.26, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 167" className="Rectangle167" style={{width: 3.56, height: 3.56, left: 1190.11, top: 252.33, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 160" className="Rectangle160" style={{width: 7.11, height: 10.67, left: 1168.78, top: 241.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 161" className="Rectangle161" style={{width: 7.11, height: 10.67, left: 1165.22, top: 238.11, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 98" className="Rectangle98" style={{width: 3.56, height: 3.56, left: 1175.89, top: 202.56, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 99" className="Rectangle99" style={{width: 3.56, height: 3.56, left: 1172.33, top: 206.11, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 100" className="Rectangle100" style={{width: 3.56, height: 3.56, left: 1168.78, top: 209.67, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 101" className="Rectangle101" style={{width: 3.56, height: 3.56, left: 1165.22, top: 213.22, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 102" className="Rectangle102" style={{width: 3.56, height: 3.56, left: 1161.67, top: 216.78, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 103" className="Rectangle103" style={{width: 3.56, height: 3.56, left: 1158.11, top: 220.33, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 104" className="Rectangle104" style={{width: 3.56, height: 3.56, left: 1154.56, top: 223.89, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 107" className="Rectangle107" style={{width: 7.11, height: 3.56, left: 1215, top: 227.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 108" className="Rectangle108" style={{width: 3.56, height: 3.56, left: 1190.11, top: 206.11, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 109" className="Rectangle109" style={{width: 3.56, height: 3.56, left: 1193.67, top: 209.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 110" className="Rectangle110" style={{width: 3.56, height: 3.56, left: 1197.22, top: 213.22, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 111" className="Rectangle111" style={{width: 3.64, height: 3.64, left: 1200.72, top: 216.92, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 112" className="Rectangle112" style={{width: 3.56, height: 3.56, left: 1204.33, top: 220.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 113" className="Rectangle113" style={{width: 3.56, height: 3.56, left: 1207.89, top: 223.89, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 114" className="Rectangle114" style={{width: 3.56, height: 3.56, left: 1211.44, top: 227.44, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 115" className="Rectangle115" style={{width: 3.56, height: 3.56, left: 1207.89, top: 234.56, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 116" className="Rectangle116" style={{width: 3.56, height: 3.56, left: 1204.33, top: 238.11, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 117" className="Rectangle117" style={{width: 3.56, height: 3.56, left: 1200.78, top: 241.67, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 118" className="Rectangle118" style={{width: 3.56, height: 3.56, left: 1197.22, top: 245.22, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 119" className="Rectangle119" style={{width: 3.56, height: 3.56, left: 1193.67, top: 248.78, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 120" className="Rectangle120" style={{width: 3.56, height: 3.56, left: 1190.11, top: 252.33, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 121" className="Rectangle121" style={{width: 3.56, height: 3.56, left: 1186.56, top: 255.89, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 123" className="Rectangle123" style={{width: 3.56, height: 3.56, left: 1158.11, top: 238.11, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 124" className="Rectangle124" style={{width: 3.56, height: 3.56, left: 1161.67, top: 241.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 125" className="Rectangle125" style={{width: 3.56, height: 3.56, left: 1165.22, top: 245.22, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 126" className="Rectangle126" style={{width: 3.56, height: 3.56, left: 1168.78, top: 248.78, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 127" className="Rectangle127" style={{width: 3.56, height: 3.56, left: 1172.33, top: 252.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 128" className="Rectangle128" style={{width: 3.56, height: 3.56, left: 1175.89, top: 255.89, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 129" className="Rectangle129" style={{width: 3.56, height: 3.56, left: 1179.44, top: 259.44, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 138" className="Rectangle138" style={{width: 3.33, height: 16.67, left: 1606.67, top: 224.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 151" className="Rectangle151" style={{width: 3.33, height: 10, left: 1606.67, top: 221.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 177" className="Rectangle177" style={{width: 3.33, height: 16.67, left: 1630, top: 228, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 178" className="Rectangle178" style={{width: 10, height: 16.67, left: 1630, top: 231.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 168" className="Rectangle168" style={{width: 19.82, height: 3.51, left: 1613.33, top: 228, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 169" className="Rectangle169" style={{width: 6.49, height: 3.33, left: 1616.67, top: 241.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 172" className="Rectangle172" style={{width: 3.33, height: 10, left: 1633.33, top: 231.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 174" className="Rectangle174" style={{width: 3.33, height: 10, left: 1630, top: 234.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 175" className="Rectangle175" style={{width: 3.33, height: 10, left: 1626.67, top: 238, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 176" className="Rectangle176" style={{width: 3.33, height: 6.67, left: 1623.33, top: 241.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 173" className="Rectangle173" style={{width: 3.33, height: 6.67, left: 1636.67, top: 228, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#F53B64'}} />
  <div data-layer="Rectangle 152" className="Rectangle152" style={{width: 3.33, height: 10, left: 1610, top: 218, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 153" className="Rectangle153" style={{width: 3.33, height: 3.33, left: 1606.67, top: 214.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 139" className="Rectangle139" style={{width: 20, height: 3.33, left: 1610, top: 208, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 147" className="Rectangle147" style={{width: 10, height: 6.67, left: 1620, top: 204.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 148" className="Rectangle148" style={{width: 10, height: 6.67, left: 1626.67, top: 211.51, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 149" className="Rectangle149" style={{width: 6.67, height: 6.67, left: 1633.33, top: 218, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 162" className="Rectangle162" style={{width: 10, height: 6.67, left: 1600, top: 251.33, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 163" className="Rectangle163" style={{width: 10, height: 6.67, left: 1593.33, top: 244.49, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 164" className="Rectangle164" style={{width: 6.67, height: 6.67, left: 1586.67, top: 238, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#FF79AD'}} />
  <div data-layer="Rectangle 97" className="Rectangle97" style={{width: 6.67, height: 3.33, left: 1606.67, top: 198, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 122" className="Rectangle122" style={{width: 6.67, height: 3.33, left: 1606.67, top: 254.67, position: 'absolute', background: '#50162B'}} />
  <div data-layer="Rectangle 105" className="Rectangle105" style={{width: 6.67, height: 3.33, left: 1583.33, top: 224.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#874A5E'}} />
  <div data-layer="Rectangle 130" className="Rectangle130" style={{width: 6.67, height: 3.33, left: 1586.67, top: 224.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 131" className="Rectangle131" style={{width: 10, height: 3.33, left: 1590, top: 221.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 150" className="Rectangle150" style={{width: 6.67, height: 3.33, left: 1613.33, top: 221.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 154" className="Rectangle154" style={{width: 3.33, height: 3.33, left: 1616.67, top: 224.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 156" className="Rectangle156" style={{width: 6.67, height: 3.33, left: 1606.67, top: 234.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 157" className="Rectangle157" style={{width: 3.33, height: 3.33, left: 1603.33, top: 231.33, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 155" className="Rectangle155" style={{width: 3.33, height: 10, left: 1636.67, top: 224.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 165" className="Rectangle165" style={{width: 3.33, height: 10, left: 1610, top: 254.49, position: 'absolute', transform: 'rotate(-180deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 140" className="Rectangle140" style={{width: 10, height: 3.33, left: 1613.33, top: 201.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 141" className="Rectangle141" style={{width: 6.67, height: 3.33, left: 1610, top: 201.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 142" className="Rectangle142" style={{width: 6.84, height: 3.33, left: 1606.67, top: 204.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 132" className="Rectangle132" style={{width: 3.33, height: 3.33, left: 1593.33, top: 228, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FFFEFF'}} />
  <div data-layer="Rectangle 133" className="Rectangle133" style={{width: 6.67, height: 3.33, left: 1593.33, top: 218, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 134" className="Rectangle134" style={{width: 10, height: 3.33, left: 1596.67, top: 214.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 135" className="Rectangle135" style={{width: 10, height: 3.33, left: 1600, top: 211.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 136" className="Rectangle136" style={{width: 10, height: 3.33, left: 1603.33, top: 208, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 137" className="Rectangle137" style={{width: 6.67, height: 3.33, left: 1606.67, top: 208, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 143" className="Rectangle143" style={{width: 10, height: 6.67, left: 1616.67, top: 211.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 144" className="Rectangle144" style={{width: 6.67, height: 6.67, left: 1620, top: 214.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 145" className="Rectangle145" style={{width: 6.67, height: 10, left: 1623.33, top: 218, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 146" className="Rectangle146" style={{width: 6.67, height: 10, left: 1626.67, top: 221.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#FEDEF2'}} />
  <div data-layer="Rectangle 158" className="Rectangle158" style={{width: 10, height: 6.67, left: 1603.33, top: 244.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#F43E64'}} />
  <div data-layer="Rectangle 159" className="Rectangle159" style={{width: 6.67, height: 6.67, left: 1600, top: 241.33, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#F43E64'}} />
  <div data-layer="Rectangle 166" className="Rectangle166" style={{width: 6.67, height: 6.67, left: 1610, top: 254.49, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#D0012D'}} />
  <div data-layer="Rectangle 167" className="Rectangle167" style={{width: 3.33, height: 3.33, left: 1616.67, top: 248, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#D0012D'}} />
  <div data-layer="Rectangle 160" className="Rectangle160" style={{width: 6.67, height: 10, left: 1596.67, top: 238, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#F43E64'}} />
  <div data-layer="Rectangle 161" className="Rectangle161" style={{width: 6.67, height: 10, left: 1593.33, top: 234.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: '#F43E64'}} />
  <div data-layer="Rectangle 98" className="Rectangle98" style={{width: 3.33, height: 3.33, left: 1603.33, top: 201.33, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 99" className="Rectangle99" style={{width: 3.33, height: 3.33, left: 1600, top: 204.67, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 100" className="Rectangle100" style={{width: 3.33, height: 3.33, left: 1596.67, top: 208, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 101" className="Rectangle101" style={{width: 3.33, height: 3.33, left: 1593.33, top: 211.33, position: 'absolute', background: '#4F1F32'}} />
  <div data-layer="Rectangle 102" className="Rectangle102" style={{width: 3.33, height: 3.33, left: 1590, top: 214.67, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 103" className="Rectangle103" style={{width: 3.33, height: 3.33, left: 1586.67, top: 218, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 104" className="Rectangle104" style={{width: 3.33, height: 3.33, left: 1583.33, top: 221.33, position: 'absolute', background: '#874A5E'}} />
  <div data-layer="Rectangle 107" className="Rectangle107" style={{width: 6.67, height: 3.33, left: 1640, top: 224.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 108" className="Rectangle108" style={{width: 3.33, height: 3.33, left: 1616.67, top: 204.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 109" className="Rectangle109" style={{width: 3.33, height: 3.33, left: 1620, top: 208, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 110" className="Rectangle110" style={{width: 3.33, height: 3.33, left: 1623.33, top: 211.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 111" className="Rectangle111" style={{width: 3.33, height: 3.33, left: 1626.67, top: 214.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 112" className="Rectangle112" style={{width: 3.33, height: 3.33, left: 1630, top: 218, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 113" className="Rectangle113" style={{width: 3.33, height: 3.33, left: 1633.33, top: 221.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 114" className="Rectangle114" style={{width: 3.33, height: 3.33, left: 1636.67, top: 224.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#561A2D'}} />
  <div data-layer="Rectangle 115" className="Rectangle115" style={{width: 3.33, height: 3.33, left: 1633.33, top: 231.33, position: 'absolute', background: '#561A2D'}} />
  <div data-layer="Rectangle 116" className="Rectangle116" style={{width: 3.33, height: 3.33, left: 1630, top: 234.67, position: 'absolute', background: '#561A2D'}} />
  <div data-layer="Rectangle 117" className="Rectangle117" style={{width: 3.33, height: 3.33, left: 1626.67, top: 238, position: 'absolute', background: '#561A2D'}} />
  <div data-layer="Rectangle 118" className="Rectangle118" style={{width: 3.33, height: 3.33, left: 1623.33, top: 241.33, position: 'absolute', background: '#561A2D'}} />
  <div data-layer="Rectangle 119" className="Rectangle119" style={{width: 3.33, height: 3.33, left: 1620, top: 244.67, position: 'absolute', background: '#54172D'}} />
  <div data-layer="Rectangle 120" className="Rectangle120" style={{width: 3.33, height: 3.33, left: 1616.67, top: 248, position: 'absolute', background: '#561A2D'}} />
  <div data-layer="Rectangle 121" className="Rectangle121" style={{width: 3.33, height: 3.33, left: 1613.33, top: 251.33, position: 'absolute', background: '#54172D'}} />
  <div data-layer="Rectangle 123" className="Rectangle123" style={{width: 3.33, height: 3.33, left: 1586.67, top: 234.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#874A5E'}} />
  <div data-layer="Rectangle 124" className="Rectangle124" style={{width: 3.33, height: 3.33, left: 1590, top: 238, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 125" className="Rectangle125" style={{width: 3.33, height: 3.33, left: 1593.33, top: 241.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 126" className="Rectangle126" style={{width: 3.33, height: 3.33, left: 1596.67, top: 244.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 127" className="Rectangle127" style={{width: 3.33, height: 3.33, left: 1600, top: 248, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 128" className="Rectangle128" style={{width: 3.33, height: 3.33, left: 1603.33, top: 251.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 129" className="Rectangle129" style={{width: 3.33, height: 3.33, left: 1606.67, top: 254.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: '#50162B'}} />
  <div data-layer="Rectangle 138" className="Rectangle138" style={{width: 3.56, height: 17.78, left: 1606.44, top: 226.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 151" className="Rectangle151" style={{width: 3.56, height: 10.67, left: 1606.44, top: 222.89, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 177" className="Rectangle177" style={{width: 3.56, height: 17.78, left: 1631.33, top: 230, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 178" className="Rectangle178" style={{width: 10.67, height: 17.78, left: 1631.33, top: 233.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 168" className="Rectangle168" style={{width: 21.15, height: 3.74, left: 1613.56, top: 230, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 169" className="Rectangle169" style={{width: 6.92, height: 3.56, left: 1617.11, top: 244.22, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 172" className="Rectangle172" style={{width: 3.56, height: 10.67, left: 1634.89, top: 233.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 174" className="Rectangle174" style={{width: 3.56, height: 10.67, left: 1631.33, top: 237.11, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 175" className="Rectangle175" style={{width: 3.56, height: 10.67, left: 1627.78, top: 240.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 176" className="Rectangle176" style={{width: 3.56, height: 7.11, left: 1624.22, top: 244.22, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 173" className="Rectangle173" style={{width: 3.56, height: 7.11, left: 1638.44, top: 230, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 152" className="Rectangle152" style={{width: 3.56, height: 10.67, left: 1610, top: 219.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 153" className="Rectangle153" style={{width: 3.56, height: 3.56, left: 1606.44, top: 215.78, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 139" className="Rectangle139" style={{width: 21.33, height: 3.56, left: 1610, top: 208.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 147" className="Rectangle147" style={{width: 10.67, height: 7.11, left: 1620.67, top: 205.11, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 148" className="Rectangle148" style={{width: 10.78, height: 4.45, left: 1624.21, top: 212.15, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 179" className="Rectangle179" style={{width: 10.78, height: 4.45, left: 1627.85, top: 215.79, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 149" className="Rectangle149" style={{width: 7.11, height: 7.11, left: 1634.89, top: 219.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 162" className="Rectangle162" style={{width: 10.67, height: 7.11, left: 1599.33, top: 254.89, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 163" className="Rectangle163" style={{width: 10.67, height: 7.11, left: 1592.22, top: 247.59, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 164" className="Rectangle164" style={{width: 7.11, height: 7.11, left: 1585.11, top: 240.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 97" className="Rectangle97" style={{width: 7.11, height: 3.56, left: 1606.44, top: 198, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 122" className="Rectangle122" style={{width: 7.11, height: 3.56, left: 1606.44, top: 258.44, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 105" className="Rectangle105" style={{width: 7.11, height: 3.56, left: 1581.56, top: 226.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 130" className="Rectangle130" style={{width: 7.11, height: 3.56, left: 1585.11, top: 226.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 131" className="Rectangle131" style={{width: 10.67, height: 3.56, left: 1588.67, top: 222.89, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 150" className="Rectangle150" style={{width: 7.11, height: 3.56, left: 1613.56, top: 222.89, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 154" className="Rectangle154" style={{width: 3.56, height: 3.56, left: 1617.11, top: 226.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 156" className="Rectangle156" style={{width: 7.11, height: 3.56, left: 1606.44, top: 237.11, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 157" className="Rectangle157" style={{width: 3.56, height: 3.56, left: 1602.89, top: 233.56, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 155" className="Rectangle155" style={{width: 3.56, height: 10.67, left: 1638.44, top: 226.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 165" className="Rectangle165" style={{width: 3.56, height: 10.67, left: 1610, top: 258.26, position: 'absolute', transform: 'rotate(-180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 140" className="Rectangle140" style={{width: 10.67, height: 3.56, left: 1613.56, top: 201.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 141" className="Rectangle141" style={{width: 7.11, height: 3.56, left: 1610, top: 201.56, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 142" className="Rectangle142" style={{width: 7.30, height: 3.56, left: 1606.44, top: 205.11, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 132" className="Rectangle132" style={{width: 3.56, height: 3.56, left: 1592.22, top: 230, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 133" className="Rectangle133" style={{width: 7.11, height: 3.56, left: 1592.22, top: 219.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 134" className="Rectangle134" style={{width: 10.67, height: 3.56, left: 1595.78, top: 215.78, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 135" className="Rectangle135" style={{width: 10.67, height: 3.56, left: 1599.33, top: 212.22, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 136" className="Rectangle136" style={{width: 10.67, height: 3.56, left: 1602.89, top: 208.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 137" className="Rectangle137" style={{width: 7.11, height: 3.56, left: 1606.44, top: 208.67, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 143" className="Rectangle143" style={{width: 10.67, height: 7.11, left: 1617.11, top: 212.22, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 144" className="Rectangle144" style={{width: 7.11, height: 7.11, left: 1620.67, top: 215.78, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 145" className="Rectangle145" style={{width: 7.11, height: 10.67, left: 1624.22, top: 219.33, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 146" className="Rectangle146" style={{width: 7.11, height: 10.67, left: 1627.78, top: 222.89, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 158" className="Rectangle158" style={{width: 10.67, height: 7.11, left: 1602.89, top: 247.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 159" className="Rectangle159" style={{width: 7.11, height: 7.11, left: 1599.33, top: 244.22, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 166" className="Rectangle166" style={{width: 7.11, height: 7.11, left: 1610, top: 258.26, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 167" className="Rectangle167" style={{width: 3.56, height: 3.56, left: 1617.11, top: 251.33, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 160" className="Rectangle160" style={{width: 7.11, height: 10.67, left: 1595.78, top: 240.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 161" className="Rectangle161" style={{width: 7.11, height: 10.67, left: 1592.22, top: 237.11, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 98" className="Rectangle98" style={{width: 3.56, height: 3.56, left: 1602.89, top: 201.56, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 99" className="Rectangle99" style={{width: 3.56, height: 3.56, left: 1599.33, top: 205.11, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 100" className="Rectangle100" style={{width: 3.56, height: 3.56, left: 1595.78, top: 208.67, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 101" className="Rectangle101" style={{width: 3.56, height: 3.56, left: 1592.22, top: 212.22, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 102" className="Rectangle102" style={{width: 3.56, height: 3.56, left: 1588.67, top: 215.78, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 103" className="Rectangle103" style={{width: 3.56, height: 3.56, left: 1585.11, top: 219.33, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 104" className="Rectangle104" style={{width: 3.56, height: 3.56, left: 1581.56, top: 222.89, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 107" className="Rectangle107" style={{width: 7.11, height: 3.56, left: 1642, top: 226.44, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 108" className="Rectangle108" style={{width: 3.56, height: 3.56, left: 1617.11, top: 205.11, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 109" className="Rectangle109" style={{width: 3.56, height: 3.56, left: 1620.67, top: 208.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 110" className="Rectangle110" style={{width: 3.56, height: 3.56, left: 1624.22, top: 212.22, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 111" className="Rectangle111" style={{width: 3.64, height: 3.64, left: 1627.72, top: 215.92, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 112" className="Rectangle112" style={{width: 3.56, height: 3.56, left: 1631.33, top: 219.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 113" className="Rectangle113" style={{width: 3.56, height: 3.56, left: 1634.89, top: 222.89, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 114" className="Rectangle114" style={{width: 3.56, height: 3.56, left: 1638.44, top: 226.44, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 115" className="Rectangle115" style={{width: 3.56, height: 3.56, left: 1634.89, top: 233.56, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 116" className="Rectangle116" style={{width: 3.56, height: 3.56, left: 1631.33, top: 237.11, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 117" className="Rectangle117" style={{width: 3.56, height: 3.56, left: 1627.78, top: 240.67, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 118" className="Rectangle118" style={{width: 3.56, height: 3.56, left: 1624.22, top: 244.22, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 119" className="Rectangle119" style={{width: 3.56, height: 3.56, left: 1620.67, top: 247.78, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 120" className="Rectangle120" style={{width: 3.56, height: 3.56, left: 1617.11, top: 251.33, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 121" className="Rectangle121" style={{width: 3.56, height: 3.56, left: 1613.56, top: 254.89, position: 'absolute', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 123" className="Rectangle123" style={{width: 3.56, height: 3.56, left: 1585.11, top: 237.11, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 124" className="Rectangle124" style={{width: 3.56, height: 3.56, left: 1588.67, top: 240.67, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 125" className="Rectangle125" style={{width: 3.56, height: 3.56, left: 1592.22, top: 244.22, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 126" className="Rectangle126" style={{width: 3.56, height: 3.56, left: 1595.78, top: 247.78, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 127" className="Rectangle127" style={{width: 3.56, height: 3.56, left: 1599.33, top: 251.33, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 128" className="Rectangle128" style={{width: 3.56, height: 3.56, left: 1602.89, top: 254.89, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
  <div data-layer="Rectangle 129" className="Rectangle129" style={{width: 3.56, height: 3.56, left: 1606.44, top: 258.44, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', background: 'rgba(144.72, 113.56, 133.04, 0.85)'}} />
</div>
  );
};

export default QuizPage;

