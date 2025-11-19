import React from 'react';

import { GameContainer } from '../components';
import { Headers } from '../components/Header';
import { ShopIcon } from '../components/ShopIcon';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {



  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden pt-6 md:pt-[95px] relative">
      {/* Navigation */}
      <nav className="bg-white shadow flex-shrink-0">
        <header><Headers /> </header>
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-[#fab630]">
                CurioCamp
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="bg-[#d9d9d9] hover:bg-[#bfbfbf] text-gray-700  px-2 py-1 rounded-md text-xl"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xl "
              >
                Logout
              </button>
            </div>
          </div>
        </div> */}
      </nav>

      {/* Crystal Counter */}
      <div className="absolute left-[112px] top-[58px] flex items-center gap-2 z-50">
        <div className="w-[168px] h-[62px] relative">
          <div className="absolute left-[9px] top-[6px] w-[159px] h-[50px] bg-[#FEDEF2] rounded-[10px]" />
          <div className="absolute left-[101px] top-[10px] text-[#561A2D] text-[35px] font-['Tiny5'] text-center flex items-center justify-center w-[18px] h-[39px]">
            2
          </div>
          {/* Crystal Icon */}
          <div className="absolute left-0 top-0 w-[62px] h-[62px] crystal-icon" />
        </div>
      </div>
      
      <Link to="/shop">
      <ShopIcon />
      </Link>

      {/* Main Content */}

      <div className="flex-1 w-full h-0 overflow-hidden">
        <GameContainer />
      </div>

      <style>{`
        .crystal-icon {
          background: url("data:image/svg+xml,%3Csvg width='62' height='62' viewBox='0 0 62 62' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M27 0H34V3H31V3H27V0Z' fill='%23874A5E'/%3E%3Cpath d='M19 0H27V3H24V3H21V5H19V7H17V10H14V14H10V17H7V21H3V24H3V27H0V34H3V37H5V38H7V41H10V45H14V48H17V51H21V55H24V58H27V58H34V55H38V51H41V48H45V45H48V41H51V38H55V34H58V27H58V24H55V21H51V17H48V14H45V10H41V7H38V5H34V3H34V0H27Z' fill='%23FF79AD'/%3E%3C/svg%3E") no-repeat center;
          background-size: contain;
          filter: drop-shadow(0 4px 4px #FFF);
        }
      `}</style>
    </div>
  );
};
