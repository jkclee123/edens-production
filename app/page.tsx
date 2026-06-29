import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to todo page (main app page)
  redirect("/todo");
}

