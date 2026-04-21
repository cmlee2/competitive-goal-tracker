import { Navbar } from "@/components/Navbar";
import { FormButton } from "@/components/FormButton";
import { createList } from "@/actions/lists";

export default function NewListPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6">Create a new goal list</h1>
        <form action={createList} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              List name
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Fitness Goals, Career Goals"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="What's this list about?"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <FormButton>Create list</FormButton>
        </form>
      </main>
    </>
  );
}
