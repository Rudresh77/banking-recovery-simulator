import { motion, AnimatePresence } from "framer-motion";

export default function SQLExecutionViewer({ sql, activeLine, executedLines, errorLine, errorMsg }) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold text-white border-b border-gray-600 pb-2 mb-3 tracking-wide">
        SQL Execution
      </h2>

      <div className="flex-1 bg-[#1e1e1e] rounded-lg border border-gray-700 overflow-auto font-mono text-sm">
        {sql.length === 0 ? (
          <p className="text-gray-500 p-4 italic">Select a scenario to begin execution...</p>
        ) : (
          <table className="w-full">
            <tbody>
              {sql.map((line, idx) => {
                const isActive   = activeLine === idx;
                const isDone     = executedLines.includes(idx);
                const isError    = errorLine === idx;
                const isComment  = line.trim().startsWith("--");

                let rowClass = "text-gray-400";
                if (isError)  rowClass = "bg-red-900/50 text-red-300";
                else if (isDone) rowClass = "bg-green-900/30 text-green-300";
                else if (isActive) rowClass = "bg-yellow-900/40 text-yellow-200";

                return (
                  <motion.tr
                    key={idx}
                    className={`${rowClass} transition-colors duration-300`}
                    animate={isActive ? { backgroundColor: ["#3a3000", "#5a4800", "#3a3000"] } : {}}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  >
                    <td className="pl-3 pr-2 py-1 text-gray-600 select-none w-8">{idx + 1}</td>
                    <td className="pr-4 py-1 whitespace-pre">
                      {isActive && <span className="mr-2 text-yellow-400 animate-pulse">▶</span>}
                      {isDone && !isError && <span className="mr-2 text-green-400">✓</span>}
                      {isError && <span className="mr-2 text-red-400">✗</span>}
                      <span className={isComment ? "text-gray-500 italic" : ""}>{line}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 bg-red-950 border border-red-600 rounded-lg px-4 py-3 text-red-300 text-sm font-mono whitespace-pre-line"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
