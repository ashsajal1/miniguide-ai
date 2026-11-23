import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AuthLayout from "@/app/components/auth/auth-layout";

export default async function Page() {
  const { userId } = await auth();

  if (userId) {
    redirect("/course/create");
  }

  return (
    <AuthLayout>
      <SignUp routing="path" path="/sign-up" />
    </AuthLayout>
  );
}
