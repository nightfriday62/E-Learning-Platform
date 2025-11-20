import { Enrollment, User } from "../models/index.js";
import { Course } from "../models/course.js";
import Progress from "../models/progress.js";
import { Quiz } from "../models/quiz.js";

class studyController {
	async getCourses(req, res) {
		try {

				const { userId, courseId } = req.params;
		
				const student = await User.findById(userId);
				if (!student || student.role !== 'student') {
					return res.status(404).json({ success: false, message: 'Student not found' });
				}
				
      const enrollemnts = await Enrollment.find({ userId }).populate('courseId', '_id');
      const coursesWithProgress = await Promise.all(
        enrollemnts.map(async (enrollment) => {
          const courseId = enrollment.courseId._id;

          const course = await Course.findById(courseId).select('title description thumbnail modules');

          const progressDocs = await Progress.find({ userId, courseId }).select('moduleId stars isOpen');

          const progressMap = new Map();
          progressDocs.forEach((p) => {
            progressMap.set(p.moduleId.toString(), { stars: p.stars, isOpen: p.isOpen });
          });

          const modulesWithProgress = course.modules.map((mod) => {
            const modObj = mod.toObject();
            const progressEntry = progressMap.get(mod._id.toString());
            modObj.stars = progressEntry?.stars ?? 1;
            modObj.isOpen = progressEntry?.isOpen ?? true;
            return modObj;
          });

          const enrollmentObj = enrollment.toObject();
          enrollmentObj.courseData = {
            _id: course._id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            isOpen: enrollment.isOpen,
            modules: modulesWithProgress
          };
          delete enrollmentObj.courseId;
          
          return enrollmentObj;
        })
      )
				res.json({ success: true, data: coursesWithProgress });
		} catch (error) {
			console.error('Get Student Courses Error:', error);
      res.status(500).json({ success: false, message: 'Failed to get study courses', error: error.message });
		}
  }

  async getQuiz(req, res) {
    try {
      const { courseId, moduleId } = req.params;

      const quiz = await Quiz.findOne({ courseId, moduleId });
      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }

      res.json({ success: true, data: quiz });
    } catch (error) {
      console.error('Get Quiz Error:', error);
      res.status(500).json({ success: false, message: 'Failed to get quiz', error: error.message });
    }
  }
  async getQuestionImage(req, res) {
    try {
      const { quizId, questionId } = req.params;
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }
      const question = quiz.questions.id(questionId);
      if (!question || !question.imageUri) {
        return res.status(404).json({ success: false, message: 'Question image not found' });
      }
      res.redirect(question.imageUri);
    } catch (error) {
      console.error('Get Question Image Error:', error);
      res.status(500).json({ success: false, message: 'Failed to get question image', error: error.message });
    }
  }
}

export default new studyController();