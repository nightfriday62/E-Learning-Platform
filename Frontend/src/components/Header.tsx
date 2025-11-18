
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


export function Headers() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const handleLogout = async () => {
        try {
          await logout();
        } catch (error) {
          console.error('Logout failed:', error);
        }
    };

    return (
        <div className="absolute left-0 top-0 w-full h-[95px] bg-[#BEC5D2] flex items-center justify-between px-8">
        <div className="text-[#0F1437] text-[58px] font-['Tiny5'] ml-12">StarLeap</div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/profile')}
            className="profile-button w-[160px] h-[50px] bg-[#D9D9D9] rounded-[10px] text-[#1E1E1E] text-[32px] font-['Tiny5'] flex items-center justify-center"
          >
            PROFILE
          </button>
          <button 
            onClick={handleLogout}
            className="logout-button w-[160px] h-[50px] bg-[#A93511] rounded-[10px] text-white text-[32px] font-['Tiny5'] flex items-center justify-center"
          >
            LOG OUT
          </button>
        </div>
      </div>
    )
}