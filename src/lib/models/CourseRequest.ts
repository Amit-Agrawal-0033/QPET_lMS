import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICourseRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  requestDate: Date;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  adminNotes?: string;
  rejectionReason?: string;
  enrollmentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CourseRequestSchema = new Schema<ICourseRequest>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    requestDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
    },
  },
  { timestamps: true }
);

export const CourseRequest: Model<ICourseRequest> =
  mongoose.models.CourseRequest ||
  mongoose.model<ICourseRequest>("CourseRequest", CourseRequestSchema);
