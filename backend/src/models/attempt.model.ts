import mongoose, { Document, Schema } from 'mongoose';

export interface IAttempt extends Document {
    quizId: mongoose.Types.ObjectId;
    email: string;
    selectedOptions: number[];
    score: number;
    attemptedAt: Date;
}

const AttemptSchema = new Schema<IAttempt>({
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    email: { type: String, required: true },
    selectedOptions: [Number],
    score: { type: Number, required: true },
    attemptedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAttempt>('Attempt', AttemptSchema);
