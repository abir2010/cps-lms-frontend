import { GraduationCap } from "lucide-react";
import Link from "next/link";

const columns = [
  {
    heading: "Learn",
    links: [
      { label: "Browse courses", href: "/#courses" },
      { label: "Sign up", href: "/register" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    heading: "Teach",
    links: [
      { label: "Become an instructor", href: "/register" },
      { label: "Log in", href: "/login" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 text-foreground">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="size-4.5" strokeWidth={2.25} />
              </span>
              <span className="text-lg font-bold">Explora Learn</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Courses built by instructors, tracked lesson by lesson — learn at
              your own pace and prove it with progress you can see.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold text-foreground">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Platform Name. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
