import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { User, IUserPermissions } from "@/lib/models/User";
import { requireAdmin } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/session";
import { logAudit } from "@/lib/services/audit.service";

// GET /api/admin/trainers - List all trainers
export async function GET(req: NextRequest) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;

    await connectDB();

    const trainers = await User.find({ role: "trainer" })
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      trainers,
    });
  } catch (error: any) {
    console.error("GET /api/admin/trainers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch trainers." },
      { status: 500 }
    );
  }
}

// POST /api/admin/trainers - Create a new trainer
export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;

    await connectDB();
    const body = await req.json();

    const { name, identifier, email, mobileNumber, password, permissions, status } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Trainer full name is required." }, { status: 400 });
    }

    if (!identifier?.trim()) {
      return NextResponse.json(
        { error: "Login identifier (email or staff ID) is required." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Check if user already exists
    const existing = await User.findOne({
      $or: [
        { identifier: cleanIdentifier },
        ...(email ? [{ email: email.trim().toLowerCase() }] : []),
        ...(mobileNumber ? [{ mobileNumber: mobileNumber.trim() }] : []),
      ],
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this identifier, email, or mobile number already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const defaultPermissions: IUserPermissions = {
      viewStudents: true,
      editStudents: false,
      viewRegistrations: false,
      editRegistrations: false,
      viewCourses: true,
      editCourses: false,
      viewEnrollments: true,
      editEnrollments: false,
      viewFees: false,
      editFees: false,
      viewReceipts: false,
      viewCertificates: true,
      editCertificates: false,
      viewReports: false,
      viewAuditReports: false,
    };

    const finalPermissions: IUserPermissions = permissions
      ? { ...defaultPermissions, ...permissions }
      : defaultPermissions;

    const newTrainer = await User.create({
      name: name.trim(),
      identifier: cleanIdentifier,
      email: email ? email.trim().toLowerCase() : undefined,
      mobileNumber: mobileNumber ? mobileNumber.trim() : undefined,
      passwordHash,
      role: "trainer",
      status: status || "active",
      permissions: finalPermissions,
    });

    // Record immutable audit log
    await logAudit({
      action: "TRAINER_CREATED",
      performedBy: session.name || session.identifier,
      performedByRole: "admin",
      targetType: "TRAINER",
      targetId: newTrainer._id.toString(),
      details: {
        trainerName: newTrainer.name,
        identifier: newTrainer.identifier,
        status: newTrainer.status,
        permissions: finalPermissions,
      },
      ipAddress: req.headers.get("x-forwarded-for") || "localhost",
    });

    return NextResponse.json({
      success: true,
      trainer: {
        _id: newTrainer._id,
        name: newTrainer.name,
        identifier: newTrainer.identifier,
        email: newTrainer.email,
        mobileNumber: newTrainer.mobileNumber,
        status: newTrainer.status,
        permissions: newTrainer.permissions,
        createdAt: newTrainer.createdAt,
      },
    });
  } catch (error: any) {
    console.error("POST /api/admin/trainers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create trainer." },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/trainers - Update trainer, assign/revoke permissions, reset password
export async function PATCH(req: NextRequest) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;

    await connectDB();
    const body = await req.json();
    const { id, name, email, mobileNumber, password, permissions, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Trainer ID is required." }, { status: 400 });
    }

    const trainer = await User.findOne({ _id: id, role: "trainer" });
    if (!trainer) {
      return NextResponse.json({ error: "Trainer account not found." }, { status: 404 });
    }

    const changes: Record<string, any> = {};

    if (name && name.trim() !== trainer.name) {
      changes.name = { from: trainer.name, to: name.trim() };
      trainer.name = name.trim();
    }

    if (email !== undefined) {
      const cleanEmail = email ? email.trim().toLowerCase() : undefined;
      if (cleanEmail !== trainer.email) {
        changes.email = { from: trainer.email, to: cleanEmail };
        trainer.email = cleanEmail;
      }
    }

    if (mobileNumber !== undefined) {
      const cleanMobile = mobileNumber ? mobileNumber.trim() : undefined;
      if (cleanMobile !== trainer.mobileNumber) {
        changes.mobileNumber = { from: trainer.mobileNumber, to: cleanMobile };
        trainer.mobileNumber = cleanMobile;
      }
    }

    if (status && (status === "active" || status === "inactive")) {
      if (status !== trainer.status) {
        changes.status = { from: trainer.status, to: status };
        trainer.status = status;
      }
    }

    if (permissions && typeof permissions === "object") {
      changes.permissions = { from: trainer.permissions, to: permissions };
      trainer.permissions = permissions;
    }

    if (password && password.trim().length >= 6) {
      trainer.passwordHash = await hashPassword(password.trim());
      changes.passwordReset = true;
    }

    await trainer.save();

    // Log the audit event
    await logAudit({
      action: changes.passwordReset
        ? "TRAINER_PASSWORD_RESET"
        : changes.status
        ? "TRAINER_STATUS_CHANGED"
        : "TRAINER_UPDATED",
      performedBy: session.name || session.identifier,
      performedByRole: "admin",
      targetType: "TRAINER",
      targetId: trainer._id.toString(),
      details: {
        trainerName: trainer.name,
        identifier: trainer.identifier,
        changes,
      },
      ipAddress: req.headers.get("x-forwarded-for") || "localhost",
    });

    return NextResponse.json({
      success: true,
      trainer: {
        _id: trainer._id,
        name: trainer.name,
        identifier: trainer.identifier,
        email: trainer.email,
        mobileNumber: trainer.mobileNumber,
        status: trainer.status,
        permissions: trainer.permissions,
        updatedAt: trainer.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/trainers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update trainer." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/trainers - Remove trainer account
export async function DELETE(req: NextRequest) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Trainer ID is required." }, { status: 400 });
    }

    const trainer = await User.findOne({ _id: id, role: "trainer" });
    if (!trainer) {
      return NextResponse.json({ error: "Trainer account not found." }, { status: 404 });
    }

    await User.findByIdAndDelete(id);

    // Audit log
    await logAudit({
      action: "TRAINER_DELETED",
      performedBy: session.name || session.identifier,
      performedByRole: "admin",
      targetType: "TRAINER",
      targetId: id,
      details: {
        deletedTrainerName: trainer.name,
        deletedIdentifier: trainer.identifier,
      },
      ipAddress: req.headers.get("x-forwarded-for") || "localhost",
    });

    return NextResponse.json({
      success: true,
      message: "Trainer account deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/trainers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete trainer." },
      { status: 500 }
    );
  }
}
