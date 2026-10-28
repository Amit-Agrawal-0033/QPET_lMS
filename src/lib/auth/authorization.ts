import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import { IUserPermissions } from "./permissions";

export * from "./permissions";

/**
 * Real-time database check for instantaneous permission revocation
 * If admin revokes a permission, the trainer's very next API request will be blocked immediately.
 */
export async function verifyTrainerPermissionRealtime(
  userId: string,
  permissionKey?: string
): Promise<{ authorized: boolean; error?: string; permissions?: IUserPermissions }> {
  try {
    await connectDB();
    const user = await User.findById(userId).select("role status permissions").lean();

    if (!user) {
      return { authorized: false, error: "Account not found." };
    }

    if (user.status !== "active") {
      return { authorized: false, error: "Account is inactive or suspended. Contact administration." };
    }

    if (user.role === "admin") {
      return { authorized: true, permissions: user.permissions as IUserPermissions };
    }

    if (user.role !== "trainer") {
      return { authorized: false, error: "Trainer clearance required." };
    }

    if (permissionKey && !user.permissions?.[permissionKey]) {
      return {
        authorized: false,
        error: `Forbidden: You do not have permission (${permissionKey}) to perform this action.`,
        permissions: user.permissions as IUserPermissions,
      };
    }

    return { authorized: true, permissions: user.permissions as IUserPermissions };
  } catch (err: any) {
    return { authorized: false, error: err.message || "Failed to verify authorization." };
  }
}
