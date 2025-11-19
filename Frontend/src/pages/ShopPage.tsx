import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Headers } from '../components/Header';

interface GiftItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: 'small' | 'large';
}

export const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  
  const giftItems: GiftItem[] = [
    {
      id: 'small-a',
      name: 'Small Gift A',
      price: 4,
      image: '/assets/images/PrizeIcon/gift-box-1.svg',
      size: 'small'
    },
    {
      id: 'small-b',
      name: 'Small Gift B',
      price: 5,
      image: '/assets/images/PrizeIcon/pencils.svg',
      size: 'small'
    },
    {
      id: 'small-c',
      name: 'Small Gift C',
      price: 4,
      image: '/assets/images/PrizeIcon/cloud.svg',
      size: 'small'
    },
    {
      id: 'large-a',
      name: 'Large Gift A',
      price: 15,
      image: '/assets/images/PrizeIcon/gift-box-2.svg',
      size: 'large'
    },
    {
      id: 'large-b',
      name: 'Large Gift B',
      price: 25,
      image: '/assets/images/PrizeIcon/camera.svg',
      size: 'large'
    },
    {
      id: 'large-c',
      name: 'Large Gift C',
      price: 30,
      image: '/assets/images/PrizeIcon/game-controller.svg',
      size: 'large'
    }
  ];

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden">
      {/* Header */}
      <Headers />
      
      {/* Background with stars */}
      <div className="absolute left-0 top-[95px] w-full h-[calc(100vh-95px)] bg-[#191A31] overflow-hidden">
        {/* Star decorations */}
        <div className="stars-container absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Crystal Counter */}
        <div className="absolute left-[112px] top-[58px] flex items-center gap-2">
          <div className="w-[168px] h-[62px] relative">
            <div className="absolute left-[9px] top-[6px] w-[159px] h-[50px] bg-[#FEDEF2] rounded-[10px]" />
            <div className="absolute left-[101px] top-[10px] text-[#561A2D] text-[35px] font-['Tiny5'] text-center flex items-center justify-center w-[18px] h-[39px]">
              2
            </div>
            {/* Crystal Icon */}
            <div className="absolute left-0 top-0 w-[62px] h-[62px] crystal-icon" />
          </div>
        </div>

        {/* Back Button */}
        <div className="absolute right-[72px] top-[66px]">
          <button
            onClick={() => navigate(-1)}
            className="w-[159px] h-[50px] bg-[#BEC5D2] rounded-[10px] text-[#1E1E1E] text-[35px] font-['Tiny5'] text-center hover:opacity-90 transition-opacity"
          >
            BACK
          </button>
        </div>

        {/* Main Container */}
        <div className="absolute left-[100px] top-[153px] w-[1729px] h-[746px] flex">
          {/* Left Panel - Welcome Section */}
          <div className="w-[528px] h-full bg-[#7E5D1A] rounded-l-[40px] flex flex-col items-center justify-center px-8 relative">
            {/* Treasure Chest Image */}
            <img
              src="/assets/images/PrizeIcon/treasure-chest.svg"
              alt="Treasure chest"
              className="w-[125px] h-[96px] mb-8 drop-shadow-[0_4px_4px_rgba(255,255,255,1)]"
            />
            
            {/* Welcome Text */}
            <h1 className="text-[#BEC5D2] text-[35px] font-['Tektur'] font-bold text-center leading-normal mb-6">
              Welcome to Space Station Store !
            </h1>
            
            {/* Description */}
            <p className="text-[#BEC5D2] text-[25px] font-['Tektur'] text-center leading-normal max-w-[526px]">
              Trade your knowledge crystals for awesome rewards! The more you learn, the more you can get!
            </p>
          </div>

          {/* Right Panel - Scrollable Gift Grid */}
          <div className="flex-1 h-full bg-[rgba(84,58,7,0.56)] rounded-r-[40px] relative">
            {/* Scrollbar Track */}
            <div className="absolute right-[24px] top-0 w-[25px] h-full bg-[rgba(0,0,0,0.55)] rounded-[40px]">
              <div className="absolute top-0 w-full h-[197px] bg-[rgba(217,217,217,0.55)] rounded-[40px]" />
            </div>

            {/* Scrollable Content */}
            <div className="h-full overflow-y-auto pr-[60px] pl-[40px] py-[47px] scrollable-gifts">
              <div className="grid grid-cols-3 gap-x-[34px] gap-y-[51px]">
                {giftItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col items-center"
                  >
                    {/* Gift Box */}
                    <div className="w-[280px] h-[300px] bg-[rgba(0,0,0,0.55)] rounded-[40px] flex items-center justify-center mb-4 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-w-[152px] max-h-[122px] object-contain"
                      />
                    </div>
                    
                    {/* Gift Name */}
                    <h3 className="text-[#BEC5D2] text-[35px] font-['Tektur'] font-bold text-center mb-2">
                      {item.name}
                    </h3>
                    
                    {/* Price Button */}
                    <div className="w-[159px] h-[50px] relative">
                      <div className="w-full h-full bg-[#FEDEF2] rounded-[10px]" />
                      <div className="absolute inset-0 flex items-center justify-center gap-1">
                        <span className="text-[#561A2D] text-[35px] font-['Tiny5'] text-center">
                          {item.price}
                        </span>
                        {/* Crystal Icon */}
                        <div className="w-[42px] h-[42px] crystal-icon-small" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .stars-container .star {
          position: absolute;
          width: 13px;
          height: 12px;
          background: #CA8E28;
          animation: twinkle 3s infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .crystal-icon {
          background: url("data:image/svg+xml,%3Csvg width='62' height='62' viewBox='0 0 62 62' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M27 0H34V3H31V3H27V0Z' fill='%23874A5E'/%3E%3Cpath d='M19 0H27V3H24V3H21V5H19V7H17V10H14V14H10V17H7V21H3V24H3V27H0V34H3V37H5V38H7V41H10V45H14V48H17V51H21V55H24V58H27V58H34V55H38V51H41V48H45V45H48V41H51V38H55V34H58V27H58V24H55V21H51V17H48V14H45V10H41V7H38V5H34V3H34V0H27Z' fill='%23FF79AD'/%3E%3C/svg%3E") no-repeat center;
          background-size: contain;
          filter: drop-shadow(0 4px 4px #FFF);
        }

        .crystal-icon-small {
          background: url("data:image/svg+xml,%3Csvg width='42' height='42' viewBox='0 0 42 42' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19 0H23V2H19V0Z' fill='%23874A5E'/%3E%3Cpath d='M19 2H23V5H21V5H19V2Z' fill='%23FFFEFF'/%3E%3Cpath d='M16 5H19V7H14V9H12V12H9V14H7V16H7V19H5V21H2V23H5V26H7V28H9V30H12V33H14V35H16V37H19V40H23V37H26V35H28V33H30V30H33V28H35V26H37V23H40V19H40V16H37V14H35V12H33V9H30V7H28V5H23V2H23V0H19V2H16V5Z' fill='%23FF79AD'/%3E%3C/svg%3E") no-repeat center;
          background-size: contain;
          filter: drop-shadow(0 4px 4px #FFF);
        }

        .a::-webkit-scrollbar {
          width: 0;
        }

        .scrollable-gifts {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
};
