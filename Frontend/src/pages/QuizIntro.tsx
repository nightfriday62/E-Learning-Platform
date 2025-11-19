import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

  const bgUrl = '/assets/images/Quiz/quiz-bg.png';
  const introbgUrl = '/assets/images/Quiz/quiz-intro-bg.png';

  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };


  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white shadow flex-shrink-0">
        <div className="max-w-7xl mx-20 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-[#fab630]">
                StarLeap
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="border-gray-700 text-gray-700 border-2 hover:bg-gray-700 hover:text-white px-3 py-1.5 rounded-md text-sm"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="border-[#A93511] border-2 text-[#A93511]  hover:bg-[#A93511] hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div
        className='w-screen h-screen bg-center'
        style={{
          backgroundImage: `url(${bgUrl})`,
          width: '100vw',
          height: '100vh',
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="w-screen h-screen flex items-center justify-center pb-10">
          <div
            className="relative bg-center bg-no-repeat bg-contain "
            style={{
              backgroundImage: `url(${introbgUrl})`,
              width: '78vw',
              height: '80vh',
            }}
          />

          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center mt-14'>
            <div className='text-[#901243] text-[54px] text-center'>Crystal Challenge</div>
            <div className='text-[#000000] text-[20px] text-center max-w-md mt-5'>
              Time to test your space skills! <br/>
              Answer these questions to earn knowledge crystals and unlock new chapter. 
            </div>
              
            <div className='flex justify-center items-center'>
              <button
              type="button"
              className="relative w-100 h-auto p-4 justify-center items-center cursor-pointer"
              onClick={handleStart}
              >
                <img
                  src="/assets/images/Quiz/btn1.png"
                  alt="start quiz btn"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-semibold">
                  START
                </div>
              </button>
            </div>

            <div className='flex justify-center items-center gap-4'>
              <span className="text-black text-md">
                Need more training?
              </span>
              <button
                type="button"
                className="relative w-50 h-auto p-4 justify-center items-center cursor-pointer"
                onClick={handleBack}
              >
                <img
                  src="/assets/images/Quiz/btn2.png"
                  alt="go back btn"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center text-[#561A2D] text-xl font-semibold">
                  BACK
                </div>
              </button>
            </div>
          </div>

            
        </div>
      </div>
    </div>
  );
};

export default QuizIntro;
