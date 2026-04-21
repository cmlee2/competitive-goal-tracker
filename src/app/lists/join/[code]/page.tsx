import { joinList } from "@/actions/lists";
import { Navbar } from "@/components/Navbar";
import { FormButton } from "@/components/FormButton";

export default async function JoinListPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <>
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-2">Join a goal list</h1>
        <p className="text-gray-500 mb-6">
          Invite code: <span className="font-mono font-semibold">{code}</span>
        </p>
        <form
          action={async () => {
            "use server";
            await joinList(code);
          }}
        >
          <FormButton>Join this list</FormButton>
        </form>
      </main>
    </>
  );
}
