import { auth } from "@/auth";
import LoginView from "./LoginView";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return <LoginView />
  }
  return (
    <div>
      you are logged in
    </div>
  );
}
