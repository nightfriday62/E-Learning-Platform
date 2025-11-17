import { useRef, useState } from 'react';
import type { CourseData, DocumentItem } from '../types/course.types';
import { useCourses } from '../contexts/CourseContext';
import PDFsViewer from './PDFsViewer';
import { useNavigate } from 'react-router-dom';

type CourseProps = CourseData & { onBack?: () => void };

export const Course = (course: CourseProps) => {
  const [viewer, setViewer] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const { getDocumentItemsFromCourse, getMaterialSecureUrl } = useCourses();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartX, setScrollStartX] = useState(0);

  const handleModuleClick = async (moduleOrder: number) => {
    setIsLoadingDocuments(true);

    const moduleDocuments = getDocumentItemsFromCourse(course._id, moduleOrder);

    const documentsWithUrls = await Promise.all(
      moduleDocuments.map(async (doc) => {
        if (doc.materialId) {
          const secureUrl = await getMaterialSecureUrl(doc.materialId);
          return { ...doc, url: secureUrl || '' };
        }
        return doc;
      })
    );

    const validDocuments = documentsWithUrls.filter((doc) => doc.url);

    setDocuments(validDocuments);
    setIsLoadingDocuments(false);
    setViewer(true);
  };

  const handleCloseViewer = () => {
    setViewer(false);
    setDocuments([]);
  };

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollStartX(scrollRef.current.scrollLeft);
  };

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - dragStartX;
    scrollRef.current.scrollLeft = scrollStartX - walk;
  };

  const endDrag = () => setIsDragging(false);

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollStartX(scrollRef.current.scrollLeft);
  };

  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = x - dragStartX;
    scrollRef.current.scrollLeft = scrollStartX - walk;
  };

  const onTouchEnd = () => setIsDragging(false);

  return (
    <>
      {course.onBack && (
        <button
          className="absolute top-7 left-7 z-10 inline-flex items-center gap-2 "
          onClick={course.onBack}
        >
          <img
            src="/assets/images/Return-Button.svg"
            alt="Back"
            className="w-18 h-18"
          />
        </button>
      )}
      <div
        ref={scrollRef}
        className={`${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } w-full h-full overflow-x-auto overflow-y-hidden select-none`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex flex-row items-center py-38 w-max">
          {course.modules &&
            course.modules.map((module) => {
              const isUnlocked = !!module.isOpen;
              if (!isUnlocked) {
                return (
                  <div
                    key={module._id}
                    className="relative w-auto h-auto flex-shrink-0 opacity-80"
                    aria-disabled="true"
                  >
                    <img
                      className="w-64 h-96 object-contain"
                      src="assets/images/Level_Elements/Base-Locked2.png"
                      alt="Module locked"
                    />
                  </div>
                );
              }

              return (
                <div
                  key={module._id}
                  className="relative w-auto h-auto flex-shrink-0 flex flex-col items-center space-y-2"
                >
                  <button
                    className="relative"
                    onClick={() => handleModuleClick(module.order)}
                    disabled={isLoadingDocuments}
                  >
                    <img
                      className="w-74 h-96 object-contain"
                      src="assets/images/Level_Elements/Base.png"
                      alt="Module button"
                    />
                    <div className="absolute top-35 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-1">
                      {[...String(module.order)].map((digit, i) => (
                        <img
                          key={i}
                          className="w-10 h-auto object-contain"
                          src={`assets/images/Level_Elements/${digit}.png`}
                          alt={`Digit ${digit}`}
                        />
                      ))}
                    </div>
                    {module.stars > 0 && (
                      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-1">
                        {Array.from({ length: Math.min(3, module.stars) }).map(
                          (_, i) => (
                            <img
                              key={i}
                              src="assets/images/Level_Elements/Star.png"
                              alt="Star"
                              className="w-8 h-auto object-contain"
                            />
                          )
                        )}
                      </div>
                    )}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-7">
                      <img
                        src="assets/images/Level_Elements/Bar.png"
                        alt="bar"
                        className="w-full h-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-semibold">
                        {module.stars === 0 ? 'In progress' : 'completed'}
                      </div>
                    </div>
                    {isLoadingDocuments && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                        <div className="text-white text-xs">Loading...</div>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/quiz-intro/${course._id}/${module._id}`);
                    }}
                  >
                    Earn Stars
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      <PDFsViewer
        isOpen={viewer}
        documents={documents}
        onClose={handleCloseViewer}
      />
    </>
  );
};
