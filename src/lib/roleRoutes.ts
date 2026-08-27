export function getHomeForRole(role: string | undefined): string {
  switch (role) {
    case "Admin":
      return "/admin";
    case "Content Manager":
      return "/content";
    case "Instructor":
      return "/instructor";
    default:
      return "/dashboard";
  }
}
