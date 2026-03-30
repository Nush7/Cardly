import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion {
    questionText: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

export interface IQuiz extends Document {
    slug: string;
    title: string;
    questions: IQuizQuestion[];
    createdBy: mongoose.Types.ObjectId;
    validUntil: Date;
    createdAt: Date;
    views: number;
}

const QuizSchema = new Schema<IQuiz>({
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    questions: [
        {
            questionText: String,
            options: [String],
            correctIndex: Number,
            explanation: String,
        },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    validUntil: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
});

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
