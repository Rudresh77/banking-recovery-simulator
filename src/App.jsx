import { useState } from "react";
import ScenarioControls    from "./components/ScenarioControls";
import SQLExecutionViewer  from "./components/SQLExecutionViewer";
import DatabaseTableViewer from "./components/DatabaseTableViewer";
import TransactionLog      from "./components/TransactionLog";
import RecoveryEngine      from "./components/RecoveryEngine";
import { useSimulator }    from "./hooks/useSimulator";
import { scenarios }       from "./data/scenarios";

export default function App() {
  const sim = useSimulator();
  const [editableSQL, setEditableSQL] = useState([]);
  const [editMode, setEditMode]       = useState(false);

  const handleRun = (key) => {
    setEditableSQL([...scenarios[key].sql]);
    setEditMode(false);
    sim.runScenario(key);
  };

  const handleRunEdited = () => {
    setEditMode(false);
    sim.runScenarioWithSQL(editableSQL);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      <header className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">
            Library Management - DBMS Recovery Simulator
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Module 15: Recovery Concepts — Atomicity · Durability · UNDO · REDO · WAL
          </p>
        </div>
        <span className={"text-xs px-3 py-1 rounded-full font-semibold " +
          (sim.isRunning ? "bg-yellow-700 text-yellow-100 animate-pulse" : "bg-green-900 text-green-300")}>
          {sim.isRunning ? "Running..." : "Idle"}
        </span>
      </header>

      <div className="flex gap-3 p-3 overflow-hidden" style={{ height: "calc(100vh - 116px)" }}>
        <div className="w-44 bg-gray-900 rounded-xl border border-gray-700 p-3 flex flex-col overflow-y-auto shrink-0">
          <ScenarioControls
            onRun={handleRun}
            onReset={sim.resetAll}
            isRunning={sim.isRunning}
            speed={sim.speed}
            setSpeed={sim.setSpeed}
            onBackupSer1={sim.backupSer1}
            onBackupSer2={sim.backupSer2}
            onDeleteDB={sim.deleteDB}
            onRestoreBackup={sim.restoreFromBackup}
            backupData={sim.backupData}
          />
        </div>

        <div className="flex flex-col flex-1 gap-3 min-w-0">
          <div className="flex gap-3 flex-1 min-h-0">
            <div className="flex-1 bg-gray-900 rounded-xl border border-gray-700 p-3 flex flex-col min-w-0">
              <SQLExecutionViewer
                sql={sim.currentSQL.length > 0 ? sim.currentSQL : editableSQL}
                activeLine={sim.activeLine}
                executedLines={sim.executedLines}
                errorLine={sim.errorLine}
                errorMsg={sim.errorMsg}
                editMode={editMode}
                editableSQL={editableSQL}
                setEditableSQL={setEditableSQL}
                onToggleEdit={() => setEditMode((p) => !p)}
                onRunEdited={handleRunEdited}
                isRunning={sim.isRunning}
              />
            </div>

            <div className="w-[480px] bg-gray-900 rounded-xl border border-gray-700 p-3 flex flex-col shrink-0">
              <DatabaseTableViewer
                db={sim.db}
                highlightedCell={sim.highlightedCell}
                commitDone={sim.commitDone}
                errorMsg={sim.errorMsg}
                pendingChanges={sim.pendingChanges}
                onInsert={sim.insertRecord}
                onDelete={sim.deleteRecord}
                onManualRollback={sim.manualRollback}
                isRunning={sim.isRunning}
              />
            </div>
          </div>

          <div className="h-40 flex gap-3 shrink-0">
            <div className="flex-1 bg-gray-900 rounded-xl border border-gray-700 p-3 flex flex-col min-w-0">
              <TransactionLog logs={sim.logs} />
            </div>
            <div className="flex-1 bg-gray-900 rounded-xl border border-gray-700 p-3 flex flex-col min-w-0">
              <RecoveryEngine
                recoveryPhase={sim.recoveryPhase}
                recoveryMessages={sim.recoveryMessages}
                transactionTimeline={sim.transactionTimeline}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
