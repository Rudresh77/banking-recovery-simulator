import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function TransactionLog({ logs }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-base font-bold text-white border-b border-gray-600 pb-2 mb-2 tracking-wide">
        Transaction Log (WAL — Write-Ahead Log)
      </h2>
      <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 bg-[#0d1117] rounded-lg border border-gray-700 p-3">
        {logs.length === 0 && (
          <p className="text-gray-600 italic">No transactions yet. Run a scenario.</p>
        )}
        {logs.map((log) => {
          const isError    = log.msg.includes("ERROR") || log.msg.includes("CRASH") || log.msg.includes("FAILURE");
          const isCommit   = log.msg.includes("COMMIT");
          const isRollback = log.msg.includes("ROLLBACK") || log.msg.includes("UNDO");
          const isRedo     = log.msg.includes("REDO");
          const isStart    = log.msg.includes("START");

          const color = isError    ? "text-red-400"
                      : isCommit   ? "text-green-400"
                      : isRollback ? "text-yellow-400"
                      : isRedo     ? "text-blue-400"
                      : isStart    ? "text-cyan-400"
                      : "text-gray-300";

          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${color} leading-relaxed`}
            >
              <span className="text-gray-600 mr-2">[{log.time}]</span>
              {log.msg}
            </motion.div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
}
