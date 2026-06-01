import React from "react";

export function GameTutorial({ title = "How to play", steps = [] }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-xl font-black text-secondary">{title}</h2>

      {steps.length > 0 ? (
        <ol className="space-y-2 pl-5 text-sm font-semibold text-muted-foreground">
          {steps.map((step, index) => (
            <li key={index} className="list-decimal">
              {step}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm font-semibold text-muted-foreground">
          Follow the instructions on the screen to play.
        </p>
      )}
    </div>
  );
}