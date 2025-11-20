import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { makeAuthenticatedRequest } from '../utils/api';
import type { QuizQuestion } from '../types/quizQuestion.types';
import { Rocket } from '../components/Rocket';
import { QuizEnd } from '../components/QuizEnd';
import { Headers } from '../components/Header';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();

  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

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
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleSubmit();
    }
  };

    const handlePrevious = () => {
    if (!quiz) return;
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
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

      const res = await makeAuthenticatedRequest(`/api/study/quiz/${quiz._id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.warn('Submission response:', res.status, text);
      }

      setFinalScore(correctCount);
      setQuizCompleted(true);
    } catch (err) {
      console.error('Submit failed', err);
      setError('Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#191A31]">
        <div className="text-white text-2xl font-['Tiny5']">Loading quiz...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#191A31]">
        <div className="text-red-500 text-2xl font-['Tiny5']">{error}</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#191A31]">
        <div className="text-white text-2xl font-['Tiny5']">No quiz available for this module.</div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;
  const progressBarWidth = 1450;
  const rocketPosition = (progress / 100) * progressBarWidth;

  return (
    <div className="fixed inset-0 bg-white overflow-hidden">
      {/* Background with noise effect */}
      <svg className="absolute left-0 top-[95px] w-full h-[985px]" width="1920" height="985" viewBox="0 0 1920 985" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_n_2076_5833)">
          <path d="M0 0H1920V985H0V0Z" fill="#191A31"/>
        </g>
        <defs>
          <filter id="filter0_n_2076_5833" x="0" y="0" width="1920" height="985" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            {React.createElement('feFlood', { floodOpacity: '0', result: 'BackgroundImageFix' })}
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
            <feTurbulence type="fractalNoise" baseFrequency="0.3333333432674408 0.3333333432674408" stitchTiles="stitch" numOctaves="3" result="noise" seed="323" />
            <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
            <feComponentTransfer in="alphaNoise" result="coloredNoise1">
              <feFuncA type="discrete" tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 "/>
            </feComponentTransfer>
            <feComposite operator="in" in2="shape" in="coloredNoise1" result="noise1Clipped" />
            <feFlood floodColor="rgba(0, 0, 0, 0.25)" result="color1Flood" />
            <feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
            <feMerge result="effect1_noise_2076_5833">
              <feMergeNode in="shape" />
              <feMergeNode in="color1" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Decorative stars/plus elements */}
      <div className="decorative-elements">
        {/* Plus icons */}
        <div className="plus-icon" style={{left: '94px', top: '704px'}}></div>
        <div className="plus-icon" style={{left: '466px', top: '635px'}}></div>
        <div className="plus-icon" style={{left: '494px', top: '460px'}}></div>
        <div className="plus-icon" style={{left: '984px', top: '460px'}}></div>
        <div className="plus-icon" style={{left: '1376px', top: '704px'}}></div>
        <div className="plus-icon" style={{left: '1391px', top: '228px'}}></div>
        <div className="plus-icon" style={{left: '899px', top: '212px'}}></div>
        <div className="plus-icon" style={{left: '1770px', top: '455px'}}></div>
        <div className="plus-icon" style={{left: '906px', top: '931px'}}></div>
        <div className="plus-icon" style={{left: '473px', top: '886px'}}></div>
        <div className="plus-icon" style={{left: '1731px', top: '915px'}}></div>
        
        {/* Small star dots */}
        <div className="star-dot" style={{left: '157px', top: '819px'}}></div>
        <div className="star-dot" style={{left: '362px', top: '704px'}}></div>
        <div className="star-dot" style={{left: '657px', top: '584px'}}></div>
        <div className="star-dot" style={{left: '616px', top: '309px'}}></div>
        <div className="star-dot" style={{left: '453px', top: '223px'}}></div>
      </div>

      {/* Header */}
      {<Headers />}

      {/* Progress bar with rocket */}
      <div className="absolute left-[261px] top-[198px] w-[1450px] h-[66px]">
        <div className="absolute left-0 top-[20px] w-[1450px] h-[31px] bg-[rgba(254,222,242,0.30)] rounded-[40px]"></div>
        <div 
          className="absolute top-[20px] h-[31px] bg-[#FEDEF2] rounded-[40px] transition-all duration-300"
          style={{width: `${(progress / 100) * 1450}px`, left: 0}}
        ></div>
        <div 
          className="absolute top-0 transition-all duration-300"
          style={{left: `${rocketPosition}px`, filter: 'drop-shadow(0 4px 4px #FFF)'}}
        >
          <Rocket />
        </div>
      </div>

      {/* Main content area */}
      {quizCompleted ? (
        <QuizEnd score={finalScore} onNewChapter={goToDashboardWithContext} />
      ) : (
        <>
          <div className="absolute left-[261px] top-[322px] w-[1477px] h-[634px] bg-[#47546C] rounded-[40px]">
            {/* Question area */}
            <div className="p-12">
              <div className="text-[#BEC5D2] text-[30px] font-['Tektur'] font-semibold mb-2">
                Question {currentIndex + 1}
              </div>
              <div className="text-[#BEC5D2] text-[30px] font-['Tektur'] mb-8">
                {currentQuestion.text}
              </div>
                <img
                  src={`http://localhost:3000/api/study/quiz/${quiz._id}/questions/${(currentQuestion as any)._id}/image`}
                  alt="No Image"
                  className="w-[500px] h-[431px] object-cover rounded-[20px]"
                />
            </div>
          </div>

          {/* Answer options panel */}
          <div className="absolute left-[1248px] top-[322px] w-[490px] h-[634px] bg-[#1A2231] rounded-r-[40px] flex flex-col items-center justify-center gap-8 px-12">
            {/* Dynamic options */}
            {(currentQuestion as any).options.map((option: any) => {
              const isSelected = selections[currentIndex] === option._id;
              return (
                <button
                  key={option._id}
                  onClick={() => selectOption(option._id)}
                  className={`option-button w-[286px] h-[81px] rounded-[20px] font-['Inter'] text-[24px] font-bold transition-all ${
                    isSelected
                      ? 'bg-[#78A888] text-[#FFFEFD]'
                      : 'bg-white text-[#45413C]'
                  }`}
                  style={{boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)'}}
                >
                  {option.text}
                </button>
              );
            })}

            {/* Next button */}
            <div className="flex flex-col items-center">
            <button
              onClick={handleNext}
              disabled={!selections[currentIndex] || submitting}
              className="next-button w-[286px] h-[49px] bg-[#B17F9E] rounded-[20px] text-white text-[24px] font-['Inter'] font-bold mt-4 disabled:opacity-45 transition-opacity"
              style={{boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)'}}
            >
              {currentIndex < quiz.questions.length - 1 ? 'Next' : (submitting ? 'Submitting...' : 'Submit')}
            </button>
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0 || submitting}
              className="next-button w-[286px] h-[49px] bg-[#B17F9E] rounded-[20px] text-white text-[24px] font-['Inter'] font-bold mt-4 disabled:opacity-45 transition-opacity"
              style={{boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)'}}
            >
              Previous
            </button>
            </div>
          </div>
        </>
      )}

      {/* Styles for decorative elements */}
      <style>{`
        .plus-icon {
          position: absolute;
          width: 41px;
          height: 45px;
        }
        .plus-icon::before {
          content: '';
          position: absolute;
          width: 13px;
          height: 45px;
          background: #CA8E28;
          left: 15px;
          top: 0;
        }
        .plus-icon::after {
          content: '';
          position: absolute;
          width: 41px;
          height: 12px;
          background: #CA8E28;
          left: 0;
          top: 17px;
        }
        .star-dot {
          position: absolute;
          width: 13px;
          height: 12px;
          background: #CA8E28;
        }
        .profile-button:hover {
          background: #C9C9C9;
        }
        .logout-button:hover {
          background: #8A2C0E;
        }
        .option-button:hover {
          transform: scale(1.02);
        }
        .next-button:hover:not(:disabled) {
          background: #9F6D8C;
        }
      `}</style>
    </div>
  );
};

export default QuizPage;
