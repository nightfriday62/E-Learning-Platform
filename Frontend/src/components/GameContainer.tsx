import { useEffect, useState } from 'react';
import { useCourses } from '../contexts/CourseContext';
import type { CourseData } from '../types/course.types';
import { Course } from './Course';

export const GameContainer = () => {
  const { courses, getThumbnailSecureUrl } = useCourses();
  const [coursesWithThumbnails, setCoursesWithThumbnails] = useState<
    CourseData[]
  >([]);
  const [openedCourse, setOpenedCourse] = useState<CourseData | null>(null);

  const bgUrl = '/assets/images/Login-Background.png';

  const handleCourseClick = (course: CourseData) => {
    console.log(course);
    setOpenedCourse(course);
  };

  useEffect(() => {
    setOpenedCourse(null);
    const fetchThumbnails = async () => {
      const coursesWithThumbnailPromises = courses.map(async (course) => {
        const fetchedUrl = await getThumbnailSecureUrl(course._id);
        return {
          ...course,
          thumbnail: fetchedUrl || '/assets/images/thumbnail-default.png',
        };
      });

      const fetchedCourses = await Promise.all(coursesWithThumbnailPromises);
      setCoursesWithThumbnails(fetchedCourses);
    };

    if (courses.length > 0) {
      fetchThumbnails();
    } else {
      setCoursesWithThumbnails([]);
    }
  }, [courses, getThumbnailSecureUrl]);

  return (
    <div
      className="game-container relative w-full h-full bg-center"
      style={{
        backgroundImage: `url(${bgUrl})`,
      }}
    >
      <div className="absolute inset-0 flex justify-center items-center gap-4 p-4">
        {openedCourse ? (
          <Course {...openedCourse} onBack={() => setOpenedCourse(null)} />
        ) : (
          coursesWithThumbnails &&
          coursesWithThumbnails.map((course) => (
            <img
              key={course._id}
              src={course.thumbnail}
              className="w-64 h-48 object-cover"
              alt={`Course thumbnail for ${course.title}`}
              onClick={() => handleCourseClick(course)}
            />
          ))
        )}
      </div>
    </div>
  );
};
