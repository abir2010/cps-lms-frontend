"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { loginUser } from "../../lib/api/auth";
import { getHomeForRole } from "../../lib/roleRoutes";
import { setCredentials } from "../../store/authSlice";
import { useAppDispatch } from "../../store/store";

// Define Zod schema
const formSchema = z.object({
  identifier: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginSchema = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // React Hook Form
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(formSchema),
  });

  // Form Submission
  const onSubmit = async (values: LoginSchema) => {
    try {
      const data = await loginUser(values.identifier, values.password);

      dispatch(setCredentials({ user: data.user, jwt: data.jwt }));
      Cookies.set("jwt", data.jwt, { expires: 7 });
      Cookies.set("role", data.user.role, { expires: 7 });

      router.push(getHomeForRole(data.user.role));
    } catch (error) {
      console.error(error);
      // Root error on the form object
      setError("root", { message: "Invalid credentials. Please try again." });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-100">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Platform Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email</Label>
              <Input
                id="identifier"
                placeholder="student@example.com"
                {...register("identifier")}
              />
              {errors.identifier && (
                <p className="text-sm font-medium text-destructive">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm font-medium text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {errors.root && (
              <p className="text-sm font-medium text-destructive">
                {errors.root.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/register" className="text-indigo-600 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
