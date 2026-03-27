import { motion, AnimatePresence } from "framer-motion";

export default function SQLExecutionViewer({
  sql, activeLine, executedLines, errorLine, errorMsg,
  editMode, editableSQL, setEditableSQL,
  onToggleEdit, onRunEdited, isRunning
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-gray-600 pb-2 mb-3">
        <h2 className="text-base font-bold text-white tracking-wide">SQL Execution</h2>
        <div className="flex gap-2">
          {!isRunning && editableSQL.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onToggleEdit}
              className={"text-xs px-3 py-1.5 rounded-lg border font-medium " +
                (editMode
                  ? "bg-gray-700 text-gray-300 border-gray-500"
                  : "bg-blue-900 text-blue-200 border-blue-700 hover:bg-blue-800")}
            >
              {editMode ? "Cancel Edit" : "Edit SQL"}
            </motion.button>
          )}
          {editMode && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onRunEdited}
              className="text-xs px-3 py-1.5 rounded-lg border bg-green-800 text-green-200 border-green-600 hover:bg-green-700 font-bold"
            >
              Run Edited SQL
            </motion.button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-[#1e1e1e] rounded-lg border border-gray-700 overflow-auto font-mono text-sm">
        {/* Edit mode — textarea per line */}
        {editMode ? (
          <div className="p-3 flex flex-col gap-1">
            <p className="text-xs text-yellow-400 mb-2">
              Edit SQL lines below. Changes affect the next run only.
            </p>
            {editableSQL.map((line, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-gray-600 text-xs w-5 text-right shrink-0">{idx + 1}</span>
                <input
                  type="text"
                  value={line}
                  onChange={(e) => {
                    const updated = [...editableSQL];
                    updated[idx] = e.target.value;
                    setEditableSQL(updated);
                  }}
                  className="flex-1 bg-gray-900 border border-gray-700 focus:border-blue-500 text-green-300 text-xs px-3 py-1.5 rounded focus:outline-none font-mono"
                />
                {/* Add line below */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const updated = [...editableSQL];
                    updated.splice(idx + 1, 0, "");
                    setEditableSQL(updated);
                  }}
                  className="text-gray-500 hover:text-green-400 text-lg leading-none px-1"
                  title="Add line"
                >+</motion.button>
                {/* Remove line */}
                {editableSQL.length > 1 && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const updated = editableSQL.filter((_, i) => i !== idx);
                      setEditableSQL(updated);
                    }}
                    className="text-gray-500 hover:text-red-400 text-lg leading-none px-1"
                    title="Remove line"
                  >×</motion.button>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* View mode — syntax highlighted execution */
          sql.length === 0 ? (
            <p className="text-gray-500 p-4 italic text-sm">
              Select a scenario to begin execution...
            </p>
          ) : (
            <table className="w-full">
              <tbody>
                {sql.map((line, idx) => {
                  const isActive  = activeLine === idx;
                  const isDone    = executedLines.includes(idx);
                  const isError   = errorLine === idx;
                  const isComment = line.trim().startsWith("--");

                  let rowClass = "text-gray-400";
                  if (isError)       rowClass = "bg-red-900/50 text-red-300";
                  else if (isDone)   rowClass = "bg-green-900/30 text-green-300";
                  else if (isActive) rowClass = "bg-yellow-900/40 text-yellow-200";

                  return (
                    <motion.tr
                      key={idx}
                      className={rowClass + " transition-colors duration-300"}
                      animate={isActive ? { opacity: [0.6, 1, 0.6] } : {}}
                      transition={{ repeat: Infinity, duration: 0.9 }}
                    >
                      <td className="pl-3 pr-2 py-1.5 text-gray-600 select-none w-8 text-xs">{idx + 1}</td>
                      <td className="pr-4 py-1.5 whitespace-pre">
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
          )
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
