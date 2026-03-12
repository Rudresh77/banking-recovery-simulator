import { motion, AnimatePresence } from "framer-motion";

export default function DatabaseTableViewer({ db, highlightedCell, commitDone, errorMsg }) {
  const showRollback = errorMsg && errorMsg.toLowerCase().includes("error");

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold text-white border-b border-gray-600 pb-2 mb-3 tracking-wide">
         Accounts Table
      </h2>

      <div className="overflow-auto rounded-lg border border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Account No</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-right">Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {db.map((row) => (
              <tr key={row.account_no} className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-2 text-gray-300 font-mono">{row.account_no}</td>
                <td className="px-4 py-2 text-gray-300">{row.name}</td>
                <td className="px-4 py-2 text-right font-bold">
                  <motion.span
                    key={row.balance}
                    animate={
                      highlightedCell === row.account_no
                        ? { backgroundColor: ["#fef08a33", "#22c55e33", "transparent"], scale: [1, 1.1, 1] }
                        : {}
                    }
                    transition={{ duration: 0.8 }}
                    className={`inline-block px-2 py-0.5 rounded ${
                      highlightedCell === row.account_no
                        ? "text-green-300 bg-green-900/50"
                        : "text-white"
                    }`}
                  >
                    {row.balance.toLocaleString("en-IN")}
                  </motion.span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {commitDone && !errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 bg-green-950 border border-green-600 rounded-lg px-4 py-2 text-green-300 text-xs"
          >
            COMMIT executed — changes are durable and permanent.
          </motion.div>
        )}
        {showRollback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 bg-yellow-950 border border-yellow-600 rounded-lg px-4 py-2 text-yellow-300 text-xs"
          >
             Rollback executed — database restored to previous consistent state.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
