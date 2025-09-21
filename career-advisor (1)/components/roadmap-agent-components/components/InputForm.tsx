import { useState } from "react";

interface Props {
  onSubmit: (goal: string) => void;
  loading?: boolean;
}

export default function InputForm({ onSubmit, loading = false }: Props) {
  const [goal, setGoal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      onSubmit(goal.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Enter your career goal (e.g. Machine Learning Engineer)"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="flex-grow border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          disabled={loading}
          required
        />
        <button
          type="submit"
          className={`px-6 py-3 rounded-lg font-medium text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-colors shadow-sm`}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Roadmap'}
        </button>
      </div>
    </form>
  );
}
