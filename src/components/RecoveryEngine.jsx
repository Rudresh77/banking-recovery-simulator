import { motion, AnimatePresence } from "framer-motion";

const phaseConfig = {
  analysis: { label: "Phase 1 — Analysis",  color: "text-yellow-300", icon: "Searching.." },
  undo:     { label: "Phase 2 — UNDO",       color: "text-red-300",    icon: "<-" },
  redo:     { label: "Phase 3 — REDO",       color: "text-blue-300",   icon: "->" },
  done:     { label: "Recovery Complete",    color: "text-green-300",  icon: "done!" },
};

export default function RecoveryEngine({ recoveryPhase, recoveryMessages, transactionTimeline }) {
  return (
    <div className="flex gap-4 h-full">
      {/* Recovery Engine */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-base font-bold text-white border-b border-gray-600 pb-2 mb-2 tracking-wide">
           Recovery Engine (UNDO / REDO)
        </h2>
        <div className="flex-1 bg-[#0d1117] rounded-lg border border-gray-700 p-3 font-mono text-xs">
          <AnimatePresence>
            {!recoveryPhase && (
              <p className="text-gray-600 italic">Recovery engine idle. Run a crash scenario to activate.</p>
            )}
            {recoveryPhase && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <div className="text-orange-400 font-bold text-sm mb-3">
                   RECOVERY MANAGER ACTIVE
                </div>
                {["analysis", "undo", "redo", "done"]
                  .filter((phase) => {
                    const order = ["analysis", "undo", "redo", "done"];
                    return order.indexOf(phase) <= order.indexOf(recoveryPhase);
                  })
                  .map((phase) => {
                    const cfg = phaseConfig[phase];
                    const isCurrent = phase === recoveryPhase;
                    return (
                      <motion.div
                        key={phase}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`${cfg.color} ${isCurrent ? "bg-gray-800/50 rounded px-2 py-1" : ""}`}
                      >
                        <span className="mr-2">{cfg.icon}</span>
                        <span className="font-semibold">{cfg.label}</span>
                        {isCurrent && recoveryMessages.map((msg, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.4 }}
                            className="ml-6 text-gray-300 mt-1"
                          >
                            → {msg}
                          </motion.div>
                        ))}
                      </motion.div>
                    );
                  })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Transaction Timeline */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-base font-bold text-white border-b border-gray-600 pb-2 mb-2 tracking-wide">
          Transaction Timeline
        </h2>
        <div className="flex-1 bg-[#0d1117] rounded-lg border border-gray-700 p-3 overflow-x-auto">
          {transactionTimeline.length === 0 ? (
            <p className="text-gray-600 italic text-xs font-mono">No timeline data yet.</p>
          ) : (
            <div className="flex items-center gap-0 flex-wrap">
              {transactionTimeline.map((item, idx) => {
                const colorMap = {
                  active:    "bg-blue-700 text-white",
                  committed: "bg-green-700 text-white",
                  error:     "bg-red-700 text-white",
                  aborted:   "bg-orange-700 text-white",
                  crash:     "bg-yellow-700 text-black",
                  recovered: "bg-teal-700 text-white",
                };
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center"
                  >
                    <div className={`text-xs px-2 py-1 rounded font-mono font-bold ${colorMap[item.status] || "bg-gray-700 text-white"}`}>
                      {item.event}
                    </div>
                    {idx < transactionTimeline.length - 1 && (
                      <div className="text-gray-500 mx-1 text-xs">→</div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
