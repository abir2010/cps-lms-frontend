"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FieldError } from "@/components/shared/field-error";
import { Loader } from "@/components/shared/loader";
import { ThemeToggle } from "@/components/shared/theme-toggle";
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

import { useRegisterMutation } from "../../store/api/authApi";
import { setCredentials } from "../../store/authSlice";
import { useAppDispatch } from "../../store/store";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type RegisterSchema = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: RegisterSchema) => {
    try {
      const data = await registerUser(values).unwrap();

      // Update global state and Edge routing cookies
      dispatch(setCredentials({ user: data.user, jwt: data.jwt }));
      Cookies.set("jwt", data.jwt, { expires: 7 });
      Cookies.set("role", data.user.role, { expires: 7 });

      // Send new sign-ups straight to the student dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      setError("root", {
        message:
          error?.data?.error?.message ||
          "Registration failed. Please try again.",
      });
    }
  };

  return (
    <div className="relative bg-background">
      <nav className="flex items-center justify-between border-b border-border bg-card px-6 py-3.5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-foreground"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4.5" strokeWidth={2.25} />
          </span>
          Explora Learn
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
        </div>
      </nav>
      <div className="relative flex min-h-screen items-center justify-center">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-125 w-125 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--primary), transparent 65%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <Card>
            <CardHeader className="items-center text-center">
              <div className="w-full flex items-center justify-center">
                <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <GraduationCap className="size-6" strokeWidth={2} />
                </div>
              </div>
              <CardTitle className="text-2xl">Explora Learn</CardTitle>
              <p className="text-sm text-muted-foreground"></p>
              Sign up for an account to start learning today!
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    {...register("username")}
                  />
                  <FieldError message={errors.username?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@example.com"
                    {...register("email")}
                  />
                  <FieldError message={errors.email?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  <FieldError message={errors.password?.message} />
                </div>

                <FieldError message={errors.root?.message} />

                <Button
                  type="submit"
                  className="mt-4 w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader size="sm" label="Creating account..." />
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Log in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
