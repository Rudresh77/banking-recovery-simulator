import { useState, useRef, useCallback } from "react";
import { INITIAL_DB, scenarios } from "../data/scenarios";

export function useSimulator() {
  const [db, setDb]                             = useState(JSON.parse(JSON.stringify(INITIAL_DB)));
  const [activeLine, setActiveLine]             = useState(-1);
  const [executedLines, setExecutedLines]       = useState([]);
  const [errorLine, setErrorLine]               = useState(-1);
  const [errorMsg, setErrorMsg]                 = useState("");
  const [logs, setLogs]                         = useState([]);
  const [recoveryPhase, setRecoveryPhase]       = useState(null);
  const [recoveryMessages, setRecoveryMessages] = useState([]);
  const [isRunning, setIsRunning]               = useState(false);
  const [currentScenario, setCurrentScenario]   = useState(null);
  const [commitDone, setCommitDone]             = useState(false);
  const [highlightedCell, setHighlightedCell]   = useState(null);
  const [speed, setSpeed]                       = useState(1200);
  const [transactionTimeline, setTransactionTimeline] = useState([]);

  const snapshotRef = useRef(null);
  const txIdRef     = useRef("T1");

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const addLog = useCallback((msg) => {
    setLogs((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), msg, time: new Date().toLocaleTimeString() }
    ]);
  }, []);

  const addTimeline = useCallback((event) => {
    setTransactionTimeline((prev) => [...prev, event]);
  }, []);

  const resetAll = useCallback(() => {
    setDb(JSON.parse(JSON.stringify(INITIAL_DB)));
    setActiveLine(-1);
    setExecutedLines([]);
    setErrorLine(-1);
    setErrorMsg("");
    setLogs([]);
    setRecoveryPhase(null);
    setRecoveryMessages([]);
    setIsRunning(false);
    setCurrentScenario(null);
    setCommitDone(false);
    setHighlightedCell(null);
    setTransactionTimeline([]);
    snapshotRef.current = null;
  }, []);

  const updateAccount = useCallback((currentDb, account_no, delta) => {
    return currentDb.map((row) =>
      row.account_no === account_no
        ? { ...row, balance: row.balance + delta }
        : row
    );
  }, []);

  const runScenario = useCallback(async (key) => {
    resetAll();
    await delay(200);

    const scenario = scenarios[key];
    setCurrentScenario(key);
    setIsRunning(true);
    txIdRef.current = "T1";

    let workingDb = JSON.parse(JSON.stringify(INITIAL_DB));
    snapshotRef.current = JSON.parse(JSON.stringify(INITIAL_DB));

    for (let i = 0; i < scenario.steps.length; i++) {
      const step = scenario.steps[i];
      setActiveLine(i);
      await delay(speed);

      if (step.type === "start") {
        addLog("[LOG] START TRANSACTION " + txIdRef.current);
        addTimeline({ tx: txIdRef.current, event: "START", status: "active" });
        setExecutedLines((p) => [...p, i]);
      }

      else if (step.type === "update") {
        const before = workingDb.find((r) => r.account_no === step.account)?.balance;
        workingDb = updateAccount(workingDb, step.account, step.delta);
        const after = workingDb.find((r) => r.account_no === step.account)?.balance;
        setDb([...workingDb]);
        setHighlightedCell(step.account);
        setTimeout(() => setHighlightedCell(null), 900);
        addLog(
          "[LOG] " + txIdRef.current +
          ": UPDATE Accounts SET balance = " + before +
          " -> " + after +
          " (Account " + step.account + ")"
        );
        addTimeline({ tx: txIdRef.current, event: "UPDATE " + step.account, status: "active" });
        setExecutedLines((p) => [...p, i]);
      }

      else if (step.type === "commit") {
        snapshotRef.current = JSON.parse(JSON.stringify(workingDb));
        addLog("[LOG] COMMIT " + txIdRef.current);
        addTimeline({ tx: txIdRef.current, event: "COMMIT", status: "committed" });
        setCommitDone(true);
        setExecutedLines((p) => [...p, i]);
      }

      else if (step.type === "error") {
        setErrorLine(step.errorLine ?? i);
        setErrorMsg(step.message);
        addLog("[LOG] " + step.message);
        addTimeline({ tx: txIdRef.current, event: "ERROR", status: "error" });

        await delay(speed);

        const original = JSON.parse(JSON.stringify(snapshotRef.current));
        workingDb = original;
        setDb(original);
        setHighlightedCell(null);

        original.forEach((row) => {
          addLog(
            "[LOG] UNDO: Account " + row.account_no +
            " balance restored -> Rs." + row.balance
          );
        });

        addLog("[LOG] ROLLBACK " + txIdRef.current + " -- Auto triggered");
        addLog("[LOG] Transaction aborted -- database restored to consistent state");
        addTimeline({ tx: txIdRef.current, event: "ROLLBACK", status: "aborted" });

        const nextStep = scenario.steps[i + 1];
        if (nextStep && nextStep.type === "rollback" && nextStep.message) {
          const combined = [step.message, nextStep.message].join("

");
          setErrorMsg(combined);
          i++;
        }

        break;
      }

      else if (step.type === "rollback") {
        const original = JSON.parse(JSON.stringify(snapshotRef.current));
        workingDb = original;
        setDb(original);
        setHighlightedCell(null);
        original.forEach((row) => {
          addLog(
            "[LOG] UNDO: Account " + row.account_no +
            " balance restored -> Rs." + row.balance
          );
        });
        addLog("[LOG] ROLLBACK " + txIdRef.current);
        addLog("[LOG] UNDO: All changes reverted to last consistent state");
        addTimeline({ tx: txIdRef.current, event: "ROLLBACK", status: "aborted" });
        if (step.message) {
          setErrorMsg((prev) => [prev, step.message].join("

"));
        }
        setExecutedLines((p) => [...p, i]);
      }

      else if (step.type === "crash") {
        setErrorMsg(step.message);
        addLog("[LOG] SYSTEM CRASH DETECTED");
        addTimeline({ tx: txIdRef.current, event: "CRASH", status: "crash" });
        setErrorLine(i);
        await delay(speed);

        setRecoveryPhase("analysis");
        setRecoveryMessages([
          "Scanning transaction log...",
          "Found incomplete transaction T1"
        ]);
        addLog("[LOG] Recovery Manager: Analysis Phase started");
        await delay(speed * 1.5);

        const nextStep = scenario.steps[i + 1];

        if (nextStep && nextStep.phase === "undo") {
          setRecoveryPhase("undo");
          const bal1  = workingDb.find((r) => r.account_no === 1001)?.balance;
          const snap1 = snapshotRef.current.find((r) => r.account_no === 1001)?.balance;
          const undoMsg = "Restoring Account 1001 balance: " + bal1 + " -> " + snap1;
          setRecoveryMessages([undoMsg]);
          addLog("[LOG] UNDO PHASE: " + undoMsg);
          await delay(speed);
          const restored = JSON.parse(JSON.stringify(snapshotRef.current));
          setDb(restored);
          workingDb = restored;

        } else if (nextStep && nextStep.phase === "redo") {
          setRecoveryPhase("redo");
          const redoMsg = "Reapplying committed transaction -- balance confirmed from WAL log";
          setRecoveryMessages([redoMsg]);
          addLog("[LOG] REDO PHASE: " + redoMsg);
          await delay(speed);
        }

        setRecoveryPhase("done");
        addLog("[LOG] Recovery complete -- database consistent");
        addTimeline({ tx: txIdRef.current, event: "RECOVERED", status: "recovered" });
        i++;
      }

      else if (step.type === "mediaFailure") {
        setErrorMsg("MEDIA FAILURE DETECTED
Database files corrupted");
        addLog("[LOG] MEDIA FAILURE: disk corruption detected");
        addTimeline({ tx: txIdRef.current, event: "MEDIA FAILURE", status: "crash" });
        setExecutedLines((p) => [...p, i]);
      }

      else if (step.type === "restore") {
        await delay(speed);
        setRecoveryPhase("analysis");
        setRecoveryMessages([
          "Locating last known good backup...",
          "Restoring from backup.sql..."
        ]);
        addLog("[LOG] Executing: mysqldump restore");
        await delay(speed * 1.5);
        const restored = JSON.parse(JSON.stringify(INITIAL_DB));
        setDb(restored);
        snapshotRef.current = restored;
        setRecoveryPhase("done");
        addLog("[LOG] Database restored from backup successfully");
        addTimeline({ tx: txIdRef.current, event: "RESTORED", status: "recovered" });
        setExecutedLines((p) => [...p, i]);
      }
    }

    setActiveLine(-1);
    setIsRunning(false);
  }, [speed, resetAll, addLog, addTimeline, updateAccount]);

  return {
    db, activeLine, executedLines, errorLine, errorMsg,
    logs, recoveryPhase, recoveryMessages, isRunning,
    currentScenario, commitDone, highlightedCell,
    speed, setSpeed, transactionTimeline,
    runScenario, resetAll,
    currentSQL: currentScenario ? scenarios[currentScenario].sql : [],
  };
                                      }
