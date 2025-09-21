import { useState } from "react";

interface Props {
  onSubmit: (start: string, goal: string) => void;
}

export default function InputForm({ onSubmit }: Props) {
  const [start, setStart] = useState("");
  const [goal, setGoal] = useState("");

  return (
    <div className="p-4 flex gap-2">
      <input
        type="text"
        placeholder="Current stage (e.g. Class 10)"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="border p-2 rounded w-1/3"
      />
      <input
        type="text"
        placeholder="Goal (e.g. Aerospace Engineer)"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        className="border p-2 rounded w-1/3"
      />
      <button
        onClick={() => onSubmit(start, goal)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Generate
      </button>
    </div>
  );
}
