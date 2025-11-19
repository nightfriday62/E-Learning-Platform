import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const QuizIntro: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();

  const handleStart = () => {
    navigate(`/earn-stars/${courseId}/${moduleId}`);
  };

  const handleBack = () => {
    const params = new URLSearchParams();
    if (courseId) params.set('courseId', courseId);
    if (moduleId) params.set('moduleId', moduleId);
    navigate(`/dashboard?${params.toString()}`);
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 bg-white">
      {/* Header */}
      <header className="h-[95px] bg-[#BEC5D2] flex items-center justify-between px-8">
        <div className="text-[58px] font-normal text-[#0F1437]" style={{ fontFamily: 'Tiny5, -apple-system, Roboto, Helvetica, sans-serif' }}>
          StarLeap
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleProfile}
            className="w-[160px] h-[50px] rounded-[10px] bg-[#D9D9D9] text-[#1E1E1E] text-[32px] font-normal"
            style={{ fontFamily: 'Tiny5, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            PROFILE
          </button>
          <button
            onClick={handleLogout}
            className="w-[160px] h-[50px] rounded-[10px] bg-[#A93511] text-white text-[32px] font-normal"
            style={{ fontFamily: 'Tiny5, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            LOG OUT
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative h-[calc(100vh-95px)] bg-[#191A31] overflow-hidden flex items-center justify-center">
        {/* Background stars decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gold star/plus symbols scattered throughout */}
          <div className="absolute left-[71px] top-[707px] w-[41px] h-[45px]">
            <div className="absolute left-[15px] top-0 w-[13px] h-[45px] bg-[#CA8E28]"></div>
            <div className="absolute left-0 top-[17px] w-[41px] h-[12px] bg-[#CA8E28]"></div>
          </div>
          <div className="absolute left-[443px] top-[638px] w-[41px] h-[45px]">
            <div className="absolute left-[15px] top-0 w-[13px] h-[45px] bg-[#CA8E28]"></div>
            <div className="absolute left-0 top-[17px] w-[41px] h-[12px] bg-[#CA8E28]"></div>
          </div>
          <div className="absolute left-[471px] top-[463px] w-[41px] h-[45px]">
            <div className="absolute left-[15px] top-0 w-[13px] h-[45px] bg-[#CA8E28]"></div>
            <div className="absolute left-0 top-[17px] w-[41px] h-[12px] bg-[#CA8E28]"></div>
          </div>
          <div className="absolute left-[961px] top-[463px] w-[41px] h-[45px]">
            <div className="absolute left-[15px] top-0 w-[13px] h-[45px] bg-[#CA8E28]"></div>
            <div className="absolute left-0 top-[17px] w-[41px] h-[12px] bg-[#CA8E28]"></div>
          </div>
          <div className="absolute left-[1353px] top-[707px] w-[41px] h-[45px]">
            <div className="absolute left-[15px] top-0 w-[13px] h-[45px] bg-[#CA8E28]"></div>
            <div className="absolute left-0 top-[17px] w-[41px] h-[12px] bg-[#CA8E28]"></div>
          </div>
          <div className="absolute left-[1368px] top-[231px] w-[41px] h-[45px]">
            <div className="absolute left-[15px] top-0 w-[13px] h-[45px] bg-[#CA8E28]"></div>
            <div className="absolute left-0 top-[17px] w-[41px] h-[12px] bg-[#CA8E28]"></div>
          </div>
          <div className="absolute left-[876px] top-[215px] w-[41px] h-[45px]">
            <div className="absolute left-[15px] top-0 w-[13px] h-[45px] bg-[#CA8E28]"></div>
            <div className="absolute left-0 top-[17px] w-[41px] h-[12px] bg-[#CA8E28]"></div>
          </div>
          <div className="absolute left-[1747px] top-[458px] w-[41px] h-[45px]">
            <div className="absolute left-[15px] top-0 w-[13px] h-[45px] bg-[#CA8E28]"></div>
            <div className="absolute left-0 top-[17px] w-[41px] h-[12px] bg-[#CA8E28]"></div>
          </div>
          <div className="absolute left-[883px] top-[934px] w-[41px] h-[45px]">
            <div className="absolute left-[15px] top-0 w-[13px] h-[45px] bg-[#CA8E28]"></div>
            <div className="absolute left-0 top-[17px] w-[41px] h-[12px] bg-[#CA8E28]"></div>
          </div>
          <div className="absolute left-[450px] top-[889px] w-[41px] h-[45px]">
            <div className="absolute left-[15px] top-0 w-[13px] h-[45px] bg-[#CA8E28]"></div>
            <div className="absolute left-0 top-[17px] w-[41px] h-[12px] bg-[#CA8E28]"></div>
          </div>
          <div className="absolute left-[1708px] top-[918px] w-[41px] h-[45px]">
            <div className="absolute left-[15px] top-0 w-[13px] h-[45px] bg-[#CA8E28]"></div>
            <div className="absolute left-0 top-[17px] w-[41px] h-[12px] bg-[#CA8E28]"></div>
          </div>
          
          {/* Small golden dots */}
          <div className="absolute left-[166px] top-[724px] w-[13px] h-[12px] bg-[#CA8E28]"></div>
          <div className="absolute left-[218px] top-[609px] w-[13px] h-[12px] bg-[#CA8E28]"></div>
          <div className="absolute left-[513px] top-[489px] w-[13px] h-[12px] bg-[#CA8E28]"></div>
          <div className="absolute left-[472px] top-[214px] w-[13px] h-[12px] bg-[#CA8E28]"></div>
          <div className="absolute left-[309px] top-[128px] w-[13px] h-[12px] bg-[#CA8E28]"></div>
        </div>

        {/* Crystal decorations */}
        <div className="absolute left-[110px] top-[148px] w-[296px] h-[296px] opacity-100">
          <img
            src="/assets/images/Quiz/crystal-large.png"
            alt="Crystal decoration"
            className="w-full h-full"
            style={{ transform: 'rotate(-13.681deg)', filter: 'drop-shadow(0 4px 4px #FFF)' }}
          />
        </div>

        {/* Pink content box */}
        <div className="relative w-[1513px] max-w-[90vw] h-[637px] rounded-[40px] bg-[rgba(254,222,242,0.84)] flex flex-col items-center justify-center px-12 z-10">
          {/* Title */}
          <h1 
            className="text-[64px] font-normal text-[#901243] text-center mb-8"
            style={{ fontFamily: 'Tiny5, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Crystal Challenge
          </h1>

          {/* Description */}
          <p 
            className="text-[45px] font-normal text-black text-center max-w-[1059px] mb-12"
            style={{ fontFamily: 'Tektur, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Time to test your space skills!
            Answer these questions to earn knowledge crystals and unlock new chapter.
          </p>

          {/* START button */}
          <div className="relative w-[742px] h-[66px] mb-6 cursor-pointer" onClick={handleStart}>
            <div className="absolute left-[12px] top-[6px] w-[717px] h-[54px] bg-[#FF79AD]"></div>
            <div className="absolute left-0 top-[18px] w-[12px] h-[30px] bg-[#FF79AD]"></div>
            <div className="absolute left-[12px] top-[6px] w-[12px] h-[12px] bg-[#FF79AD]"></div>
            <div className="absolute left-[12px] top-[48px] w-[12px] h-[12px] bg-[#FF79AD]"></div>
            <div className="absolute left-[717px] top-[6px] w-[12px] h-[12px] bg-[#FF79AD]"></div>
            <div className="absolute left-[717px] top-[48px] w-[12px] h-[12px] bg-[#FF79AD]"></div>
            <div className="absolute left-[25px] top-[60px] w-[693px] h-[6px] bg-[#FF79AD]"></div>
            <div className="absolute left-[25px] top-0 w-[693px] h-[6px] bg-[#FF79AD]"></div>
            <div className="absolute left-[730px] top-[18px] w-[12px] h-[30px] bg-[#FF79AD]"></div>
            <div 
              className="absolute left-[33px] top-[9px] w-[682px] h-[47px] flex items-center justify-center text-white text-[36px] font-bold"
              style={{ fontFamily: 'Tektur, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              START
            </div>
          </div>

          {/* BACK button */}
          <div className="relative w-[360px] h-[66px] bg-[#D9BFD3] cursor-pointer mb-4" onClick={handleBack}>
            <div className="absolute left-[6px] top-[6px] w-[348px] h-[54px] bg-[#FEDEF2]"></div>
            <div className="absolute left-0 top-[18px] w-[6px] h-[30px] bg-[rgba(135,74,94,0.63)]"></div>
            <div className="absolute left-[6px] top-[6px] w-[6px] h-[12px] bg-[rgba(135,74,94,0.63)]"></div>
            <div className="absolute left-[6px] top-[48px] w-[6px] h-[12px] bg-[rgba(135,74,94,0.63)]"></div>
            <div className="absolute left-[348px] top-[6px] w-[6px] h-[12px] bg-[rgba(135,74,94,0.63)]"></div>
            <div className="absolute left-[348px] top-[48px] w-[6px] h-[12px] bg-[rgba(135,74,94,0.63)]"></div>
            <div className="absolute left-[12px] top-[60px] w-[336px] h-[6px] bg-[rgba(135,74,94,0.63)]"></div>
            <div className="absolute left-[12px] top-0 w-[336px] h-[6px] bg-[rgba(135,74,94,0.63)]"></div>
            <div className="absolute left-[354px] top-[18px] w-[6px] h-[30px] bg-[rgba(135,74,94,0.63)]"></div>
            <div 
              className="absolute left-[16px] top-[9px] w-[331px] h-[47px] flex items-center justify-center text-[rgba(86,26,45,0.63)] text-[36px] font-bold"
              style={{ fontFamily: 'Tektur, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              BACK
            </div>
          </div>

          {/* Need more training link */}
          <a
            onClick={handleBack}
            className="text-black text-[28px] font-normal underline cursor-pointer"
            style={{ fontFamily: 'Tektur, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Need more training?
          </a>
        </div>

        {/* Additional crystal decorations on the right */}
        <div className="absolute right-[100px] bottom-[150px] w-[160px] h-[160px] opacity-100" style={{ transform: 'rotate(17.823deg)', filter: 'drop-shadow(0 4px 4px #FFF)' }}>
          {/* Simplified crystal shape using divs */}
          <div className="w-full h-full relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF79AD] via-[#F53B64] to-[#D0012D] opacity-80"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizIntro;
