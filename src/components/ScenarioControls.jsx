import { motion } from "framer-motion";

const buttons = [
  { key: "normal",             label: "1. Normal Transaction",                    color: "from-green-600 to-green-800"   },
  { key: "accountNotFound",    label: "2. Failure - Account Not Found",            color: "from-red-600 to-red-800"       },
  { key: "insufficientBalance",label: "3. Failure - Insufficient Balance",         color: "from-orange-600 to-orange-800" },
  { key: "systemCrash",        label: "4. System Crash (Soft Crash)",              color: "from-yellow-600 to-yellow-800" },
  { key: "mediaFailure",       label: "5. Media Failure (Disk Crash)",             color: "from-purple-600 to-purple-800" },
  { key: "atomicity",          label: "6. Atomicity Demonstration",                color: "from-blue-600 to-blue-800"     },
  { key: "durability",         label: "7. Durability Demonstration",               color: "from-teal-600 to-teal-800"     },
];

export default function ScenarioControls({ onRun, onReset, isRunning, speed, setSpeed }) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <h2 className="text-lg font-bold text-white border-b border-gray-600 pb-2 tracking-wide">
        Scenarios
      </h2>

      {buttons.map((btn) => (
        <motion.button
          key={btn.key}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={isRunning}
          onClick={() => onRun(btn.key)}
          className={`bg-gradient-to-r ${btn.color} text-white text-sm font-medium
            px-3 py-2 rounded-lg shadow-md text-left transition-opacity
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {btn.label}
        </motion.button>
      ))}

      <div className="mt-auto pt-3 border-t border-gray-600">
        <label className="text-xs text-gray-400 block mb-1">
           Speed: {speed}ms/step
        </label>
        <input
          type="range" min={400} max={3000} step={200}
          value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="bg-gray-700 hover:bg-gray-600 text-white text-sm
          px-3 py-2 rounded-lg mt-2 transition-colors border border-gray-500"
      >
         Reset Database
      </motion.button>
    </div>
  );
}
