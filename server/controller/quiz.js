import QuizSchema from '../model/quizModel.js';
import QuestionSchema from '../model/questionModel.js';
import Score from '../model/scoreModel.js';
import guestModel from '../model/guestModel.js';
import mongoose from 'mongoose';
import express from 'express';
import { Resend } from "resend";
import {
  generateQuizAccessToken,
  verifyQuizAccessToken,
} from "../utils/guestJwt.js";

// Create Quiz

export const createQuiz = async (req, res) => {
  try {

    const quiz = new QuizSchema({
      title: req.body.title,
      description: req.body.description,
      visibility: req.body.visibility,
      author: req.body.author,
      questions: req.body.questions,
      rotation: req.body.rotation,
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// create quiz with bulk questions
export const createQuizWithQuestions = async (req, res) => {
  try {
    const { title, description, author, visibility, questions, rotation } = req.body;
    
    console.log("Quiz Author:", author);

    if (!title || !author || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        error: "Title, author, and a valid questions array are required."
      });
    }

    for (const question of questions) {
      console.log("Received question:", question);

      if (!question.text || !Array.isArray(question.choices) || question.points === undefined) {
        return res.status(400).json({
          error: "Each question must have text, choices, and points."
        });
      }
    }

    const createdQuestions = await QuestionSchema.insertMany(questions);

    const quiz = await QuizSchema.create({
      title,
      description,
      author,
      visibility,
      questions: createdQuestions.map((q) => q._id),
      rotation,
    });
    
    await quiz.save();
    res.status(201).json(quiz);

  } catch (err) {
    console.log("createQuizWithQuestions error:", err.message);
    res.status(400).json({ error: err.message });
  };
};

// READ all quizzes
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await QuizSchema.find().populate('author', 'name').populate('questions.questionId');
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPublicQuizzes = async (req, res) => {
  try {
    const quizzes = await QuizSchema.find({ visibility: { $in: ['public'] }
    })
      .populate('author', 'name')
      .populate('questions.questionId');
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// READ a single quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const { access } = req.query; // ?access=token

    // ✅ validate id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        hasError: true,
        message: "Invalid quiz ID",
      });
    }

    // ✅ fetch quiz
    const quiz = await QuizSchema.findById(id)
      .populate("author", "name")
      .populate("questions.questionId");

    if (!quiz) {
      return res.status(404).json({
        hasError: true,
        message: "Quiz not found",
      });
    }

    // ✅ detect logged-in user (if exists)
    const currentUserId = req.user?._id || req.user?.id || null;

    const isOwner =
      currentUserId &&
      quiz.author?._id?.toString() === currentUserId.toString();

    /* ========================================================
       ACCESS CONTROL
    ======================================================== */

    // 🔓 PUBLIC → always allowed
    if (quiz.visibility === "public") {
      return res.status(200).json({ quiz });
    }

    // 🔗 UNLISTED → require valid token OR owner
    if (quiz.visibility === "unlisted") {
      if (isOwner) {
        return res.status(200).json({ quiz });
      }

      if (!access) {
        return res.status(401).json({
          hasError: true,
          message: "This quiz requires a valid shared link.",
        });
      }

      const isValid = verifyQuizAccessToken(access, id);

      if (!isValid) {
        return res.status(401).json({
          hasError: true,
          message: "Invalid or expired shared link.",
        });
      }

      return res.status(200).json({ quiz });
    }

    // 🔒 PRIVATE → only owner
    if (quiz.visibility === "private") {
      if (!isOwner) {
        return res.status(403).json({
          hasError: true,
          message: "Not authorized to access this private quiz.",
        });
      }

      return res.status(200).json({ quiz });
    }

    // ❌ fallback
    return res.status(400).json({
      hasError: true,
      message: "Invalid quiz visibility.",
    });

  } catch (error) {
    console.error("getQuizById error:", error);

    return res.status(500).json({
      hasError: true,
      message: error.message || "Server error",
    });
  }
};

// UPDATE a quiz by ID
export const updateQuiz = async (req, res) => {
  try {
    console.log("FULL req.body:", req.body);

    const { title, description, visibility, questions, rotation } = req.body;

    const updatedQuiz = await QuizSchema.findByIdAndUpdate(
      req.params.id,
      { title, description, visibility, questions, rotation },
      { new: true, runValidators: true }
    );

    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// DELETE a quiz by ID
export const deleteQuiz = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const quizId = req.params.id;

    console.log(`User ${userId} is attempting to delete quiz ${quizId}`);

    const quiz = await QuizSchema.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    console.log("Quiz ownership:", quiz.author.toString());
    // 🔐 Ownership check
    if (quiz.author.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this quiz" });
    }

    // delete questions first
    await QuestionSchema.deleteMany({ _id: { $in: quiz.questions.map((q) => q.questionId) } });

    await quiz.deleteOne();

    res.status(200).json({ message: "Quiz deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// nuke quizzes
export const deleteAllQuizzes = async (req, res) => {
  try {
    await QuizSchema.deleteMany({});
    res.status(200).json({ message: "All quizzes deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


//share quiz by id
// export const shareQuizById = async (req, res) => {
//   try {
//     const { email } = req.body;

//     //Generate URL 
//     const { id: quizId } = req.params;
  
//     // optional: ensure user owns quiz
//     // if (quiz.owner.toString() !== req.user.id) return 403
  
//     const payload = {
//       quizId,
//       scope: 'guest_play'
//     };
  
//     const token = jwt.sign(payload, process.env.QUIZ_SHARE_SECRET, {
//       expiresIn: '1h' // industry standard
//     });
  
//     const shareUrl = `${process.env.CLIENT_URL}/play/quiz/${quizId}?access=${token}`;

//     //Send URL to email
    


//     // This is a placeholder response for demonstration purposes.
//     res.status(200).json({ message: `Quiz ${quizId} shared with ${email}` });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// }



const resend = new Resend(process.env.RESEND_API_KEY);

export const shareQuizViaEmail = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        hasError: true,
        message: "Email is required",
      });
    }

    // 🔒 Verify quiz exists
    const quiz = await QuizSchema.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        hasError: true,
        message: "Quiz not found",
      });
    }

    // // 🔒 Optional: only allow owner to share
    // if (req.user.role !== "guest" && quiz.author.toString() !== req.user.id) {
    //   return res.status(403).json({
    //     hasError: true,
    //     message: "Not authorized to share this quiz",
    //   });
    // }


        //     guestLink = `${window.location.origin}/play/${
        //   quiz._id
        // }?access=${encodeURIComponent(accessToken)}`;

    let guestLink = `${process.env.CLIENT_URL}/play/${quizId}`;

    if (quiz.visibility === "unlisted") {
      const accessToken = generateQuizAccessToken(req.user, quizId);

      if (!accessToken) {
        alert("Could not generate share link.");
        return;
      }

      guestLink = `${process.env.CLIENT_URL}/play/${quizId}?access=${encodeURIComponent(accessToken)}`;
    }


    // 📧 Send email
    await resend.emails.send({
      from: "StudyZone <onboarding@resend.dev>",
      to: email,
      subject: `You've been invited to try "${quiz.title}"`,
      html: `
        <h2>🎯 You've been invited to a quiz!</h2>
        <p><strong>${quiz.title}</strong></p>
        <p>${quiz.description || ""}</p>

        <a href="${guestLink}" 
           style="display:inline-block;padding:12px 18px;background:#00d9ff;color:#06111f;
           text-decoration:none;border-radius:8px;font-weight:bold;">
          Play Quiz
        </a>

        <p style="margin-top:15px;font-size:12px;color:#888;">
          This link expires soon and is for guest access only.
        </p>
      `,
    });

    return res.status(200).json({
      hasError: false,
      message: "Quiz shared successfully",
    });
  } catch (error) {
    console.error("Share quiz error:", error);

    return res.status(500).json({
      hasError: true,
      message: "Failed to share quiz",
    });
  }
};

export const getAllQuizzesByAuthorId = async (req, res) => {
  try {
    const { authorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(400).json({ message: 'Invalid author ID' });
    }

    const quizzes = await QuizSchema.find({ author: authorId })
      .populate('author', 'name')
      .populate('questions.questionId');

    res.status(200).json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
};


// MIGRATE all old quiz question arrays to new refPath format
export const migrateQuizQuestionsToRefPath = async (req, res) => {
  try {
    const quizzes = await QuizSchema.find();

    let updatedCount = 0;
    let skippedCount = 0;

    for (const quiz of quizzes) {
      if (!Array.isArray(quiz.questions)) {
        skippedCount++;
        continue;
      }

      const alreadyMigrated = quiz.questions.every((q) => {
        return q?.questionId && q?.questionModel;
      });

      if (alreadyMigrated) {
        skippedCount++;
        continue;
      }

      const migratedQuestions = quiz.questions
        .filter((q) => q)
        .map((q) => {
          // Old format: ObjectId
          if (q instanceof mongoose.Types.ObjectId) {
            return {
              questionId: q,
              questionModel: "Question",
            };
          }

          // Old format after Mongoose casting: {_id: ObjectId} maybe
          if (q._id && !q.questionId) {
            return {
              questionId: q._id,
              questionModel: "Question",
            };
          }

          // Already close to correct
          if (q.questionId) {
            return {
              questionId: q.questionId,
              questionModel: q.questionModel || "Question",
            };
          }

          return null;
        })
        .filter(Boolean);

      quiz.questions = migratedQuestions;
      await quiz.save();

      updatedCount++;
    }

    res.status(200).json({
      message: "Quiz question migration completed.",
      updatedCount,
      skippedCount,
      totalQuizzes: quizzes.length,
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const submitQuizScore = async (req, res) => {
  try {
    const { quizId, score, userId, guestId } = req.body;

    console.log("Submitting:", { quizId, userId, guestId, score });

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        hasError: true,
        message: "Invalid quiz ID",
      });
    }

    const quiz = await QuizSchema.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        hasError: true,
        message: "Quiz not found",
      });
    }

    const payload = {
      quiz: quizId,
      score,

    };

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      payload.user = userId;
    }

    if (guestId) {
      const guestUser = await guestModel.findById(guestId);

      if (!guestUser) {
        return res.status(404).json({
          hasError: true,
          message: "Guest not found",
        });
      }

      payload.guest = guestUser._id;
      console.log("Found guest user for score submission:", guestUser._id);
    }

    if (!payload.user && !payload.guest) {
      return res.status(400).json({
        hasError: true,
        message: "Score must belong to a user or guest.",
      });
    }

    const newScore = await Score.create(payload);
    await newScore.save();

    return res.status(201).json({
      hasError: false,
      message: "Score submitted successfully",
      score: newScore,
    });
  } catch (error) {
    console.error("Submit score error:", error);

    return res.status(500).json({
      hasError: true,
      message: "Failed to submit score",
    });
  }
};


export const getPublicLeaderboard = async (req, res) => {
  try {
    const scores = await Score.find()
      .populate({
        path: "quiz",
        select: "title visibility",
        match: { visibility: "public" },
      })
      .populate("user", "firstName lastName username email")
      .populate("guest", "name")
      .sort({ score: -1, createdAt: 1 });

    


    const publicScores = scores.filter((s) => s.quiz);

    return res.status(200).json({
      hasError: false,
      scores: publicScores,
    });
  } catch (error) {
    console.error("Get public leaderboard error:", error);

    return res.status(500).json({
      hasError: true,
      message: "Failed to load leaderboard.",
    });
  }
};



export const generateQuizGuestToken = async (req, res) => {
  try {
    const { quizId, expiresIn } = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        hasError: true,
        message: "Invalid quiz ID",
      });
    }

    const quiz = await QuizSchema.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        hasError: true,
        message: "Quiz not found",
      });
    }

    if (quiz.visibility === "private") {
      return res.status(403).json({
        hasError: true,
        message: "Private quizzes cannot be shared.",
      });
    }

    if (quiz.author.toString() !== req.user.id) {
      return res.status(403).json({
        hasError: true,
        message: "Not authorized to share this quiz.",
      });
    }

    const token = generateQuizAccessToken(req.user, quizId, expiresIn);

    return res.status(200).json({
      hasError: false,
      token,
    });
  } catch (error) {
    console.error("generateQuizGuestToken error:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to generate share token.",
    });
  }
};