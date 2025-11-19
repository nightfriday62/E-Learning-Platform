import { Link } from "react-router-dom"

export function ShopIcons() {
    return (
        <div className="flex items-center gap-6 bg-transparent md:pl-8">
            <div className="flex items-center gap-2 z-50 ml-6">
                <div className="w-[168px] h-[62px] relative">
                    <div className="absolute left-[9px] top-[6px] w-[159px] h-[50px] bg-[#FEDEF2] rounded-[10px]" />
                    <div className="absolute left-[101px] top-[10px] text-[#561A2D] text-[35px] font-['Tiny5'] text-center flex items-center justify-center w-[18px] h-[39px]">
                        2
                    </div>
                    {/* Crystal Icon */}
                    <div className="absolute left-0 top-0 w-[62px] h-[62px] crystal-icon" />
                </div>
            </div>
            <Link to="/shop" className="cursor-pointer">
                <div data-layer="Group 126" className="Group126 w-56 h-16 relative">
                    <div data-layer="BoxProfile" className="Boxprofile w-52 h-12 left-[4px] top-[12px] absolute bg-amber-400 rounded-[10px]" />
                    <div data-layer="SHOP" className="Shop left-[105px] top-[18px] absolute text-center justify-start text-amber-700 text-4xl font-normal font-['Tiny5']">SHOP</div>
                    <img data-layer="AdobeStock_1451995998 1" className="Adobestock14519959981 w-20 h-16 left-0 top-0 absolute shadow-[0px_4px_4px_0px_rgba(255,255,255,1.00)]" src="https://placehold.co/83x63" />
                </div>
            </Link>
        </div>
    );
}