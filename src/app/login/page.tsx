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

import { getHomeForRole } from "../../lib/roleRoutes";
import { useLoginMutation } from "../../store/api/authApi";
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
  const [login, { isLoading }] = useLoginMutation();

  // React Hook Form
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(formSchema),
  });

  // Form Submission
  const onSubmit = async (values: LoginSchema) => {
    try {
      const data = await login(values).unwrap();

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
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute top-5 right-6">
        <ThemeToggle />
      </div>
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
            <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-6" strokeWidth={2} />
            </div>
            <CardTitle className="text-2xl">Platform Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email</Label>
                <Input
                  id="identifier"
                  placeholder="student@example.com"
                  {...register("identifier")}
                />
                <FieldError message={errors.identifier?.message} />
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader size="sm" label="Signing in..." />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
