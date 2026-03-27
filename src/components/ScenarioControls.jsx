import { motion } from "framer-motion";

const scenarioButtons = [
  { key: "normal",       label: "1. Normal Transaction",         color: "from-green-700 to-green-900"   },
  { key: "notFound",     label: "2. Failure - Book Not Found",   color: "from-red-700 to-red-900"       },
  { key: "systemCrash",  label: "3. System Crash (Soft Crash)",  color: "from-yellow-700 to-yellow-900" },
  { key: "mediaFailure", label: "4. Media Failure (Disk Crash)", color: "from-purple-700 to-purple-900" },
  { key: "durability",   label: "5. Durability (REDO Demo)",     color: "from-teal-700 to-teal-900"     },
];

export default function ScenarioControls({
  onRun, onReset, isRunning, speed, setSpeed,
  onBackupSer1, onBackupSer2, onDeleteDB, onRestoreBackup, backupData
}) {
  return (
    <div className="flex flex-col gap-2 h-full">
      <h2 className="text-sm font-bold text-white border-b border-gray-600 pb-2 tracking-widest uppercase">
        Scenarios
      </h2>

      <div className="flex flex-col gap-1.5">
        {scenarioButtons.map((btn) => (
          <motion.button
            key={btn.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={isRunning}
            onClick={() => onRun(btn.key)}
            className={"bg-gradient-to-r " + btn.color + " text-white text-xs font-medium px-3 py-2 rounded-lg shadow text-left disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"}
          >
            {btn.label}
          </motion.button>
        ))}
      </div>

      <div className="border-t border-gray-700 pt-2 mt-1">
        <p className="text-xs text-gray-500 mb-1.5 font-bold uppercase tracking-wider">Database</p>
        <div className="flex flex-col gap-1">
          <motion.button whileTap={{ scale: 0.95 }} onClick={onBackupSer1}
            className="bg-blue-900 hover:bg-blue-800 text-blue-200 text-xs px-2 py-1.5 rounded-lg text-left border border-blue-700">
            Backup for Sir (ser1.sql)
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={onBackupSer2}
            className="bg-indigo-900 hover:bg-indigo-800 text-indigo-200 text-xs px-2 py-1.5 rounded-lg text-left border border-indigo-700">
            Backup Simulation (ser2.sql)
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={onRestoreBackup}
            disabled={!backupData}
            className={"text-xs px-2 py-1.5 rounded-lg text-left border " + (backupData ? "bg-teal-900 hover:bg-teal-800 text-teal-200 border-teal-700" : "bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed")}>
            Restore from Backup
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={onDeleteDB}
            className="bg-red-950 hover:bg-red-900 text-red-300 text-xs px-2 py-1.5 rounded-lg text-left border border-red-800">
            Delete Database
          </motion.button>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-2 mt-auto">
        <label className="text-xs text-gray-400 block mb-1">Speed: {speed}ms / step</label>
        <input type="range" min={400} max={3000} step={200} value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full accent-blue-500" />
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={onReset}
        className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-2 rounded-lg border border-gray-600">
        Reset Database
      </motion.button>
    </div>
  );
}
