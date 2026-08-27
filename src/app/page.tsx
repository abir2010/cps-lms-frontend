import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-slate-50 px-6">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-indigo-600">
          Platform Name
        </h1>
        <p className="text-lg text-slate-600">
          Learn new skills with courses built by instructors, track your
          progress lesson by lesson, and read the latest from our blog.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/login">
            <Button size="lg">Log In</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">
              Sign Up
            </Button>
          </Link>
          <Link href="/blog">
            <Button size="lg" variant="ghost">
              Read the Blog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
