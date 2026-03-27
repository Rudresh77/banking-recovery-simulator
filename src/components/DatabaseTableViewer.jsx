import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DatabaseTableViewer({
  db, highlightedCell, commitDone, errorMsg,
  pendingChanges, onInsert, onDelete, onManualRollback, isRunning
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: "", title: "", author: "", copies: "" });

  const handleInsert = () => {
    if (!form.id || !form.title || !form.author || !form.copies) return;
    onInsert({
      id: form.id.toUpperCase(),
      title: form.title,
      author: form.author,
      copies: parseInt(form.copies)
    });
    setForm({ id: "", title: "", author: "", copies: "" });
    setShowForm(false);
  };

  const showRollbackMsg = errorMsg && (errorMsg.toLowerCase().includes("error") || errorMsg.toLowerCase().includes("rollback"));

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center justify-between border-b border-gray-600 pb-2 flex-wrap gap-2">
        <h2 className="text-base font-bold text-white tracking-wide">Books Table</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <AnimatePresence>
            {pendingChanges && !isRunning && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.95 }}
                onClick={onManualRollback}
                className="bg-yellow-700 hover:bg-yellow-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold border border-yellow-500 animate-pulse"
              >
                ROLLBACK
              </motion.button>
            )}
          </AnimatePresence>
          {!isRunning && (
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowForm(!showForm)}
              className={"text-white text-xs px-3 py-1.5 rounded-lg border " + (showForm ? "bg-gray-700 border-gray-500" : "bg-green-800 hover:bg-green-700 border-green-600")}>
              {showForm ? "Cancel" : "+ Add Book"}
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800 rounded-lg p-3 border border-gray-600 grid grid-cols-2 gap-2 overflow-hidden"
          >
            {[
              { key: "id",     label: "Book ID",  placeholder: "B004"        },
              { key: "title",  label: "Title",    placeholder: "Book Title"   },
              { key: "author", label: "Author",   placeholder: "Author Name"  },
              { key: "copies", label: "Copies",   placeholder: "5", type: "number" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs text-gray-400 block mb-1">{field.label}</label>
                <input
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-600 text-white text-xs px-2 py-1.5 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
            ))}
            <div className="col-span-2">
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleInsert}
                className="w-full bg-green-700 hover:bg-green-600 text-white text-xs py-2 rounded-lg font-semibold">
                Insert Record
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto rounded-lg border border-gray-700 min-h-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-300 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold">Book ID</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold">Title</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold">Author</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold">Copies</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {db.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-600 italic text-sm">
                  No records — database is empty.
                </td>
              </tr>
            )}
            {db.map((row) => (
              <motion.tr key={row.id} layout
                className="border-t border-gray-700 hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-2.5 text-cyan-400 font-mono text-sm font-bold">{row.id}</td>
                <td className="px-4 py-2.5 text-gray-100 text-sm">{row.title}</td>
                <td className="px-4 py-2.5 text-gray-400 text-xs">{row.author}</td>
                <td className="px-4 py-2.5 text-center">
                  <motion.span
                    key={row.copies}
                    animate={highlightedCell === row.id
                      ? { scale: [1, 1.25, 1] }
                      : {}}
                    transition={{ duration: 0.5 }}
                    className={"inline-block w-10 text-center py-0.5 rounded font-mono font-bold text-base " +
                      (highlightedCell === row.id
                        ? "text-green-300 bg-green-900/60 ring-1 ring-green-500"
                        : "text-white")}
                  >
                    {row.copies}
                  </motion.span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  {!isRunning && (
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => onDelete(row.id)}
                      className="text-red-500 hover:text-red-300 text-xs px-2 py-0.5 rounded hover:bg-red-900/30 transition-colors">
                      Delete
                    </motion.button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {commitDone && !errorMsg && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-green-950 border border-green-700 rounded-lg px-3 py-2 text-green-300 text-xs">
            COMMIT executed — changes are durable and permanent.
          </motion.div>
        )}
        {showRollbackMsg && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-yellow-950 border border-yellow-700 rounded-lg px-3 py-2 text-yellow-300 text-xs">
            Rollback executed — database restored to previous consistent state.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
