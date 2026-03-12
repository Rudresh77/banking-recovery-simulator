import ScenarioControls   from "./components/ScenarioControls";
import SQLExecutionViewer from "./components/SQLExecutionViewer";
import DatabaseTableViewer from "./components/DatabaseTableViewer";
import TransactionLog     from "./components/TransactionLog";
import RecoveryEngine     from "./components/RecoveryEngine";
import { useSimulator }   from "./hooks/useSimulator";

export default function App() {
  const sim = useSimulator();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">
             Banking Transaction Recovery Simulator
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            DBMS Recovery Concepts — Atomicity · Durability · UNDO · REDO · WAL
          </p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
          sim.isRunning ? "bg-yellow-700 text-yellow-100 animate-pulse" : "bg-green-900 text-green-300"
        }`}>
          {sim.isRunning ? " Running..." : "● Idle"}
        </span>
      </header>

      {/* Top 3 panels */}
      <div className="flex flex-1 gap-3 p-3 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Left */}
        <div className="w-56 bg-gray-900 rounded-xl border border-gray-700 p-3 flex flex-col overflow-y-auto shrink-0">
          <ScenarioControls
            onRun={sim.runScenario}
            onReset={sim.resetAll}
            isRunning={sim.isRunning}
            speed={sim.speed}
            setSpeed={sim.setSpeed}
          />
        </div>

        {/* Center */}
        <div className="flex-1 bg-gray-900 rounded-xl border border-gray-700 p-3 flex flex-col min-w-0">
          <SQLExecutionViewer
            sql={sim.currentSQL}
            activeLine={sim.activeLine}
            executedLines={sim.executedLines}
            errorLine={sim.errorLine}
            errorMsg={sim.errorMsg}
          />
        </div>

        {/* Right */}
        <div className="w-80 bg-gray-900 rounded-xl border border-gray-700 p-3 flex flex-col shrink-0">
          <DatabaseTableViewer
            db={sim.db}
            highlightedCell={sim.highlightedCell}
            commitDone={sim.commitDone}
            errorMsg={sim.errorMsg}
          />
        </div>
      </div>

      {/* Bottom panels */}
      <div className="h-44 flex gap-3 px-3 pb-3">
        {/* WAL Log */}
        <div className="flex-1 bg-gray-900 rounded-xl border border-gray-700 p-3 flex flex-col min-w-0">
          <TransactionLog logs={sim.logs} />
        </div>

        {/* Recovery Engine + Timeline */}
        <div className="flex-1 bg-gray-900 rounded-xl border border-gray-700 p-3 flex flex-col min-w-0">
          <RecoveryEngine
            recoveryPhase={sim.recoveryPhase}
            recoveryMessages={sim.recoveryMessages}
            transactionTimeline={sim.transactionTimeline}
          />
        </div>
      </div>
    </div>
  );
}
