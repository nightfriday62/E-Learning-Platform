import React from 'react';

interface QuizEndProps {
  score: number;
  onNewChapter: () => void;
}

export const QuizEnd: React.FC<QuizEndProps> = ({ score, onNewChapter }) => {
  return (
    <div className="quiz-end-container">
      {/* Decorative stars */}
      <div className="absolute left-[153px] top-[223px] w-[513px] h-[608px]">
        <div className="star-small" style={{left: '0px', top: '596px'}}></div>
        <div className="star-small" style={{left: '205px', top: '481px'}}></div>
        <div className="star-small" style={{left: '500px', top: '361px'}}></div>
        <div className="star-small" style={{left: '459px', top: '86px'}}></div>
        <div className="star-small" style={{left: '296px', top: '0px'}}></div>
      </div>

      {/* Congratulations Card */}
      <div className="congratulations-card">
        <div className="congratulations-title">Congratulation!</div>
        
        <div className="score-container">
          <div className="score-text">You've earned</div>
          <div className="score-number">3 </div>
          <div className="star-icon">
            <svg width="53" height="52" viewBox="0 0 53 52" fill="none" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 4px 4px #FFF)'}}>
              <rect x="9" y="23" width="15" height="3" transform="rotate(90 9 23)" fill="#FF79AD"/>
              <rect x="15" y="20" width="9" height="3" transform="rotate(90 15 20)" fill="#FF79AD"/>
              <rect x="29" y="26" width="15" height="3" transform="rotate(90 29 26)" fill="#FF79AD"/>
              <rect x="29" y="29" width="15" height="9" transform="rotate(90 29 29)" fill="#FF79AD"/>
              <rect x="26" y="26" width="3" height="17" transform="rotate(90 26 26)" fill="#FF79AD"/>
              <rect x="29" y="38" width="3" height="6" transform="rotate(90 29 38)" fill="#F53B64"/>
              <rect x="38" y="29" width="9" height="3" transform="rotate(90 38 29)" fill="#F53B64"/>
              <rect x="35" y="32" width="9" height="3" transform="rotate(90 35 32)" fill="#F53B64"/>
              <rect x="32" y="35" width="9" height="3" transform="rotate(90 32 35)" fill="#F53B64"/>
              <rect x="32" y="38" width="6" height="3" transform="rotate(90 32 38)" fill="#F53B64"/>
              <rect x="44" y="26" width="6" height="3" transform="rotate(90 44 26)" fill="#F53B64"/>
              <rect x="18" y="17" width="9" height="3" transform="rotate(90 18 17)" fill="#FF79AD"/>
              <rect x="21" y="15" width="3" height="3" transform="rotate(90 21 15)" fill="#FF79AD"/>
              <rect x="24" y="9" width="3" height="17" transform="rotate(90 24 9)" fill="#FF79AD"/>
              <rect x="29" y="6" width="6" height="9" transform="rotate(90 29 6)" fill="#FF79AD"/>
              <rect x="35" y="12" width="6" height="9" transform="rotate(90 35 12)" fill="#FF79AD"/>
              <rect x="41" y="17" width="6" height="6" transform="rotate(90 41 17)" fill="#FF79AD"/>
              <rect x="18" y="38" width="6" height="9" transform="rotate(-90 18 38)" fill="#FF79AD"/>
              <rect x="12" y="32" width="6" height="9" transform="rotate(-90 12 32)" fill="#FF79AD"/>
              <rect x="6" y="29" width="6" height="6" transform="rotate(-90 6 29)" fill="#FF79AD"/>
              <rect x="24" y="0" width="3" height="6" fill="#874A5E"/>
              <rect x="24" y="49" width="3" height="6" fill="#50162B"/>
              <rect x="0" y="23" width="3" height="6" transform="rotate(90 0 23)" fill="#874A5E"/>
              <rect x="3" y="23" width="3" height="6" transform="rotate(90 3 23)" fill="#FFFEFF"/>
              <rect x="6" y="20" width="3" height="9" transform="rotate(90 6 20)" fill="#FFFEFF"/>
              <rect x="26" y="20" width="3" height="6" transform="rotate(90 26 20)" fill="#FFFEFF"/>
              <rect x="29" y="23" width="3" height="3" transform="rotate(90 29 23)" fill="#FFFEFF"/>
              <rect x="24" y="26" width="3" height="6" transform="rotate(-90 24 26)" fill="#FFFEFF"/>
              <rect x="21" y="26" width="3" height="3" transform="rotate(-90 21 26)" fill="#FFFEFF"/>
              <rect x="41" y="23" width="9" height="3" transform="rotate(90 41 23)" fill="#FFFEFF"/>
              <rect x="24" y="41" width="9" height="3" fill="#FFFEFF"/>
              <rect x="26" y="3" width="3" height="9" transform="rotate(90 26 3)" fill="#FFFEFF"/>
              <rect x="24" y="3" width="3" height="6" transform="rotate(90 24 3)" fill="#FFFEFF"/>
              <rect x="21" y="6" width="3" height="6" transform="rotate(90 21 6)" fill="#FFFEFF"/>
              <rect x="9" y="26" width="3" height="3" transform="rotate(90 9 26)" fill="#FFFEFF"/>
              <rect x="9" y="17" width="3" height="6" transform="rotate(90 9 17)" fill="#FEDEF2"/>
              <rect x="12" y="15" width="3" height="9" transform="rotate(90 12 15)" fill="#FEDEF2"/>
              <rect x="15" y="12" width="3" height="9" transform="rotate(90 15 12)" fill="#FEDEF2"/>
              <rect x="18" y="9" width="3" height="9" transform="rotate(90 18 9)" fill="#FEDEF2"/>
              <rect x="21" y="9" width="3" height="6" transform="rotate(90 21 9)" fill="#FEDEF2"/>
              <rect x="26" y="12" width="6" height="9" transform="rotate(90 26 12)" fill="#FEDEF2"/>
              <rect x="29" y="15" width="6" height="6" transform="rotate(90 29 15)" fill="#FEDEF2"/>
              <rect x="29" y="17" width="9" height="6" transform="rotate(90 29 17)" fill="#FEDEF2"/>
              <rect x="32" y="20" width="9" height="6" transform="rotate(90 32 20)" fill="#FEDEF2"/>
              <rect x="21" y="32" width="6" height="9" transform="rotate(-90 21 32)" fill="#F43E64"/>
              <rect x="18" y="32" width="6" height="6" transform="rotate(-90 18 32)" fill="#F43E64"/>
              <rect x="26" y="43" width="6" height="6" transform="rotate(-90 26 43)" fill="#D0012D"/>
              <rect x="32" y="41" width="3" height="3" transform="rotate(-90 32 41)" fill="#D0012D"/>
              <rect x="15" y="29" width="9" height="6" transform="rotate(-90 15 29)" fill="#F43E64"/>
              <rect x="12" y="26" width="9" height="6" transform="rotate(-90 12 26)" fill="#F43E64"/>
              <rect x="21" y="3" width="3" height="3" fill="#874A5E"/>
              <rect x="18" y="6" width="3" height="3" fill="#874A5E"/>
              <rect x="15" y="9" width="3" height="3" fill="#874A5E"/>
              <rect x="12" y="12" width="3" height="3" fill="#4F1F32"/>
              <rect x="9" y="15" width="3" height="3" fill="#874A5E"/>
              <rect x="6" y="17" width="3" height="3" fill="#874A5E"/>
              <rect x="3" y="20" width="3" height="3" fill="#874A5E"/>
              <rect x="50" y="23" width="3" height="6" transform="rotate(-90 50 23)" fill="#561A2D"/>
              <rect x="29" y="3" width="3" height="3" fill="#561A2D"/>
              <rect x="32" y="6" width="3" height="3" fill="#561A2D"/>
              <rect x="35" y="9" width="3" height="3" fill="#561A2D"/>
              <rect x="38" y="12" width="3" height="3" fill="#561A2D"/>
              <rect x="41" y="15" width="3" height="3" fill="#561A2D"/>
              <rect x="44" y="17" width="3" height="3" fill="#561A2D"/>
              <rect x="47" y="20" width="3" height="3" fill="#561A2D"/>
              <rect x="47" y="29" width="3" height="3" fill="#561A2D"/>
              <rect x="44" y="32" width="3" height="3" fill="#561A2D"/>
              <rect x="41" y="35" width="3" height="3" fill="#561A2D"/>
              <rect x="38" y="38" width="3" height="3" fill="#561A2D"/>
              <rect x="35" y="41" width="3" height="3" fill="#54172D"/>
              <rect x="32" y="44" width="3" height="3" fill="#561A2D"/>
              <rect x="29" y="47" width="3" height="3" fill="#54172D"/>
              <rect x="3" y="29" width="3" height="3" fill="#874A5E"/>
              <rect x="6" y="32" width="3" height="3" fill="#50162B"/>
              <rect x="9" y="35" width="3" height="3" fill="#50162B"/>
              <rect x="12" y="38" width="3" height="3" fill="#50162B"/>
              <rect x="15" y="41" width="3" height="3" fill="#50162B"/>
              <rect x="18" y="44" width="3" height="3" fill="#50162B"/>
              <rect x="21" y="47" width="3" height="3" fill="#50162B"/>
            </svg>
          </div>
        </div>

        <button onClick={onNewChapter} className="new-chapter-button">
          New Chapter
        </button>
      </div>

      <style>{`
        .quiz-end-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .star-small {
          position: absolute;
          width: 13px;
          height: 12px;
          background: #CA8E28;
        }

        .congratulations-card {
          position: absolute;
          left: 611px;
          top: 357px;
          width: 715px;
          height: 405px;
          background: #47546C;
          border-radius: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 36px;
        }

        .congratulations-title {
          color: #FEDEF2;
          text-align: center;
          font-family: Tiny5, -apple-system, Roboto, Helvetica, sans-serif;
          font-size: 64px;
          font-weight: 400;
          line-height: normal;
        }

        .score-container {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 52px;
        }

        .score-text {
          color: #BEC5D2;
          font-family: Tektur, -apple-system, Roboto, Helvetica, sans-serif;
          font-size: 45px;
          font-weight: 700;
          line-height: normal;
        }

        .score-number {
          color: #FEDEF2;
          font-family: Tektur, -apple-system, Roboto, Helvetica, sans-serif;
          font-size: 45px;
          font-weight: 700;
          line-height: normal;
        }

        .star-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .new-chapter-button {
          display: flex;
          width: 286px;
          height: 49px;
          justify-content: center;
          align-items: center;
          border-radius: 20px;
          background: #B17F9E;
          box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
          color: #FFF;
          text-align: center;
          font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
          font-size: 24px;
          font-weight: 700;
          line-height: 100px;
          border: none;
          cursor: pointer;
          transition: background 0.3s;
        }

        .new-chapter-button:hover {
          background: #9F6D8C;
        }
      `}</style>
    </div>
  );
};
