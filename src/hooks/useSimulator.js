import { useState, useRef, useCallback } from "react";
import { INITIAL_DB, scenarios } from "../data/scenarios";

const NL = String.fromCharCode(10);

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
  const [pendingChanges, setPendingChanges]     = useState(false);
  const [backupData, setBackupData]             = useState(null);

  const snapshotRef = useRef(JSON.parse(JSON.stringify(INITIAL_DB)));
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

  const generateSQL = useCallback((data) => {
    const lines = [
      "-- Library Management System Backup",
      "-- Generated: " + new Date().toLocaleString(),
      "",
      "DROP TABLE IF EXISTS Books;",
      "CREATE TABLE Books (",
      "  book_id VARCHAR(10) PRIMARY KEY,",
      "  title   VARCHAR(100),",
      "  author  VARCHAR(100),",
      "  copies  INT",
      ");",
      ""
    ];
    data.forEach((row) => {
      lines.push(
        "INSERT INTO Books VALUES ('" +
        row.id + "', '" + row.title + "', '" +
        row.author + "', " + row.copies + ");"
      );
    });
    return lines.join(NL);
  }, []);

  const downloadSQL = useCallback((filename, content) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const backupSer1 = useCallback(() => {
    const content = generateSQL(db);
    downloadSQL("backup_ser1.sql", content);
    addLog("[LOG] Backup created: backup_ser1.sql (for Sir presentation)");
    addTimeline({ tx: "SYS", event: "BACKUP-S1", status: "committed" });
  }, [db, generateSQL, downloadSQL, addLog, addTimeline]);

  const backupSer2 = useCallback(() => {
    const snapshot = JSON.parse(JSON.stringify(db));
    setBackupData(snapshot);
    const content = generateSQL(snapshot);
    downloadSQL("backup_ser2.sql", content);
    addLog("[LOG] Backup created: backup_ser2.sql (simulation backup saved in memory)");
    addTimeline({ tx: "SYS", event: "BACKUP-S2", status: "committed" });
  }, [db, generateSQL, downloadSQL, addLog, addTimeline]);

  const deleteDB = useCallback(() => {
    setDb([]);
    snapshotRef.current = [];
    addLog("[LOG] DATABASE DELETED -- all records removed");
    addTimeline({ tx: "SYS", event: "DB DELETED", status: "crash" });
  }, [addLog, addTimeline]);

  const restoreFromBackup = useCallback(() => {
    const source = backupData
      ? JSON.parse(JSON.stringify(backupData))
      : JSON.parse(JSON.stringify(INITIAL_DB));

    const fresh = source.map((r) => ({ ...r }));
    setDb(fresh);
    snapshotRef.current = JSON.parse(JSON.stringify(fresh));

    setErrorMsg("");
    setCommitDone(false);
    setPendingChanges(false);
    setActiveLine(-1);
    setExecutedLines([]);
    setErrorLine(-1);
    setRecoveryPhase(null);
    setRecoveryMessages([]);
    setCurrentScenario(null);

    addLog("[LOG] Database restored from " + (backupData ? "backup_ser2.sql" : "initial state"));
    addLog("[LOG] " + fresh.length + " records loaded successfully");
    addTimeline({ tx: "SYS", event: "RESTORED", status: "recovered" });
  }, [backupData, addLog, addTimeline]);

  // Soft reset — clears UI state but PRESERVES current db and snapshotRef
  const softReset = useCallback(() => {
    setActiveLine(-1);
    setExecutedLines([]);
    setErrorLine(-1);
    setErrorMsg("");
    setRecoveryPhase(null);
    setRecoveryMessages([]);
    setIsRunning(false);
    setCurrentScenario(null);
    setCommitDone(false);
    setHighlightedCell(null);
    setTransactionTimeline([]);
    setPendingChanges(false);
  }, []);

  // Hard reset — resets everything including db back to INITIAL_DB
  const resetAll = useCallback(() => {
    const initial = JSON.parse(JSON.stringify(INITIAL_DB));
    setDb(initial);
    snapshotRef.current = JSON.parse(JSON.stringify(initial));
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
    setPendingChanges(false);
  }, []);

  const updateBook = useCallback((currentDb, id, delta) => {
    return currentDb.map((row) =>
      row.id === id ? { ...row, copies: row.copies + delta } : row
    );
  }, []);

  const insertRecord = useCallback((record) => {
    setDb((prev) => {
      if (prev.find((r) => r.id === record.id)) {
        addLog("[LOG] ERROR: Book ID " + record.id + " already exists");
        return prev;
      }
      const updated = [...prev, record];
      snapshotRef.current = JSON.parse(JSON.stringify(updated));
      addLog(
        "[LOG] INSERT INTO Books VALUES ('" +
        record.id + "', '" + record.title + "', '" +
        record.author + "', " + record.copies + ")"
      );
      addTimeline({ tx: "T_INS", event: "INSERT " + record.id, status: "committed" });
      return updated;
    });
  }, [addLog, addTimeline]);

  const deleteRecord = useCallback((id) => {
    setDb((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      snapshotRef.current = JSON.parse(JSON.stringify(updated));
      addLog("[LOG] DELETE FROM Books WHERE book_id = '" + id + "'");
      addTimeline({ tx: "T_DEL", event: "DELETE " + id, status: "aborted" });
      return updated;
    });
  }, [addLog, addTimeline]);

  const manualRollback = useCallback(() => {
    if (snapshotRef.current) {
      const restored = JSON.parse(JSON.stringify(snapshotRef.current));
      setDb(restored);
      setPendingChanges(false);
      setErrorMsg("Manual ROLLBACK executed" + NL + "Database restored to consistent state.");
      addLog("[LOG] MANUAL ROLLBACK executed by user");
      addLog("[LOG] Database restored to pre-transaction state");
      addTimeline({ tx: txIdRef.current, event: "ROLLBACK", status: "aborted" });
    }
  }, [addLog, addTimeline]);

  const executeSteps = useCallback(async (steps) => {
    // Always use current snapshotRef — preserves manually added/deleted records
    const currentState = snapshotRef.current && snapshotRef.current.length >= 0
      ? JSON.parse(JSON.stringify(snapshotRef.current))
      : JSON.parse(JSON.stringify(INITIAL_DB));

    let workingDb = JSON.parse(JSON.stringify(currentState));
    snapshotRef.current = JSON.parse(JSON.stringify(currentState));

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setActiveLine(i);
      await delay(speed);

      if (step.type === "start") {
        addLog("[LOG] START TRANSACTION " + txIdRef.current);
        addTimeline({ tx: txIdRef.current, event: "START", status: "active" });
        setExecutedLines((p) => [...p, i]);
      }

      else if (step.type === "update") {
        const found = workingDb.find((r) => r.id === step.id);
        if (!found) {
          setErrorLine(i);
          setErrorMsg("ERROR: Book " + step.id + " not found in current database.");
          addLog("[LOG] ERROR: Book " + step.id + " not found -- ROLLBACK triggered");
          addTimeline({ tx: txIdRef.current, event: "ERROR", status: "error" });
          await delay(speed);
          const original = JSON.parse(JSON.stringify(snapshotRef.current));
          workingDb = original;
          setDb(original);
          setPendingChanges(false);
          original.forEach((row) => {
            addLog("[LOG] UNDO: Book " + row.id + " copies restored -> " + row.copies);
          });
          addLog("[LOG] ROLLBACK " + txIdRef.current + " -- Auto triggered");
          addTimeline({ tx: txIdRef.current, event: "ROLLBACK", status: "aborted" });
          break;
        }
        const before = found.copies;
        workingDb = updateBook(workingDb, step.id, step.delta);
        const after = workingDb.find((r) => r.id === step.id).copies;
        setDb([...workingDb]);
        setHighlightedCell(step.id);
        setPendingChanges(true);
        setTimeout(() => setHighlightedCell(null), 900);
        addLog(
          "[LOG] " + txIdRef.current +
          ": UPDATE Books SET copies = " + before +
          " -> " + after + " (Book " + step.id + ")"
        );
        addTimeline({ tx: txIdRef.current, event: "UPDATE " + step.id, status: "active" });
        setExecutedLines((p) => [...p, i]);
      }

      else if (step.type === "commit") {
        snapshotRef.current = JSON.parse(JSON.stringify(workingDb));
        addLog("[LOG] COMMIT " + txIdRef.current);
        addTimeline({ tx: txIdRef.current, event: "COMMIT", status: "committed" });
        setCommitDone(true);
        setPendingChanges(false);
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
        setPendingChanges(false);
        original.forEach((row) => {
          addLog("[LOG] UNDO: Book " + row.id + " copies restored -> " + row.copies);
        });
        addLog("[LOG] ROLLBACK " + txIdRef.current + " -- Auto triggered");
        addLog("[LOG] Transaction aborted -- database restored to consistent state");
        addTimeline({ tx: txIdRef.current, event: "ROLLBACK", status: "aborted" });
        break;
      }

      else if (step.type === "crash") {
        setErrorMsg(step.message);
        addLog("[LOG] SYSTEM CRASH DETECTED");
        addTimeline({ tx: txIdRef.current, event: "CRASH", status: "crash" });
        setErrorLine(i);
        setPendingChanges(false);
        await delay(speed);

        setRecoveryPhase("analysis");
        setRecoveryMessages([
          "Scanning transaction log...",
          "Found incomplete transaction T1"
        ]);
        addLog("[LOG] Recovery Manager: Analysis Phase started");
        await delay(speed * 1.5);

        const nextStep = steps[i + 1];

        if (nextStep && nextStep.phase === "undo") {
          setRecoveryPhase("undo");
          const crashedBook = workingDb[0];
          const snapBook    = snapshotRef.current.find((r) => r.id === crashedBook.id);
          const undoMsg     =
            "Restoring Book " + crashedBook.id +
            " copies: " + crashedBook.copies +
            " -> " + (snapBook ? snapBook.copies : "?");
          setRecoveryMessages([undoMsg]);
          addLog("[LOG] UNDO PHASE: " + undoMsg);
          await delay(speed);
          const restored = JSON.parse(JSON.stringify(snapshotRef.current));
          setDb(restored);
          workingDb = restored;
        } else if (nextStep && nextStep.phase === "redo") {
          setRecoveryPhase("redo");
          const redoMsg = "Reapplying committed transaction -- copies confirmed from WAL log";
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
        setErrorMsg("MEDIA FAILURE DETECTED" + NL + "Database files corrupted");
        addLog("[LOG] MEDIA FAILURE: disk corruption detected");
        addTimeline({ tx: txIdRef.current, event: "MEDIA FAILURE", status: "crash" });
        setExecutedLines((p) => [...p, i]);
      }

      else if (step.type === "restore") {
        await delay(speed);
        setRecoveryPhase("analysis");
        setRecoveryMessages([
          "Locating last known good backup...",
          "Restoring from backup_ser2.sql..."
        ]);
        addLog("[LOG] Executing: mysqldump restore from backup_ser2.sql");
        await delay(speed * 1.5);
        const source = backupData
          ? JSON.parse(JSON.stringify(backupData))
          : JSON.parse(JSON.stringify(INITIAL_DB));
        const fresh = source.map((r) => ({ ...r }));
        setDb(fresh);
        snapshotRef.current = JSON.parse(JSON.stringify(fresh));
        setRecoveryPhase("done");
        addLog("[LOG] Database restored from backup successfully");
        addLog("[LOG] " + fresh.length + " records loaded");
        addTimeline({ tx: txIdRef.current, event: "RESTORED", status: "recovered" });
        setExecutedLines((p) => [...p, i]);
      }
    }

    setActiveLine(-1);
    setIsRunning(false);
  }, [speed, addLog, addTimeline, updateBook, backupData]);

  // Runs a preset scenario — uses softReset to preserve current db
  const runScenario = useCallback(async (key) => {
    softReset();
    await delay(200);
    setCurrentScenario(key);
    setIsRunning(true);
    txIdRef.current = "T1";
    await executeSteps(scenarios[key].steps);
  }, [softReset, executeSteps]);

  // Runs edited SQL lines — also uses softReset to preserve current db
  const runScenarioWithSQL = useCallback(async (sqlLines) => {
    softReset();
    await delay(200);
    setCurrentScenario("custom");
    setIsRunning(true);
    txIdRef.current = "T1";

    const steps = [{ type: "start" }];
    let hasExplicitEnd = false;

    sqlLines.forEach((line, idx) => {
      const l = line.trim().toLowerCase();
      if (l === "" || l.startsWith("--")) return;

      if (l.startsWith("update") && l.includes("copies = copies -")) {
        const idMatch    = line.match(/book_id\s*=\s*'([^']+)'/i);
        const deltaMatch = line.match(/copies\s*-\s*(\d+)/i);
        if (idMatch && deltaMatch) {
          steps.push({
            type:  "update",
            id:    idMatch[1].toUpperCase(),
            delta: -parseInt(deltaMatch[1])
          });
        }
      } else if (l.startsWith("update") && l.includes("copies = copies +")) {
        const idMatch    = line.match(/book_id\s*=\s*'([^']+)'/i);
        const deltaMatch = line.match(/copies\s*\+\s*(\d+)/i);
        if (idMatch && deltaMatch) {
          steps.push({
            type:  "update",
            id:    idMatch[1].toUpperCase(),
            delta: +parseInt(deltaMatch[1])
          });
        }
      } else if (l.includes("commit")) {
        steps.push({ type: "commit" });
        hasExplicitEnd = true;
      } else if (l.includes("rollback")) {
        steps.push({
          type:      "error",
          message:   "ROLLBACK in SQL -- transaction aborted",
          errorLine: idx
        });
        hasExplicitEnd = true;
      }
    });

    if (!hasExplicitEnd) {
      steps.push({ type: "commit" });
    }

    await executeSteps(steps);
  }, [softReset, executeSteps]);

  return {
    db, activeLine, executedLines, errorLine, errorMsg,
    logs, recoveryPhase, recoveryMessages, isRunning,
    currentScenario, commitDone, highlightedCell,
    speed, setSpeed, transactionTimeline,
    pendingChanges, backupData,
    runScenario, runScenarioWithSQL, resetAll,
    insertRecord, deleteRecord, manualRollback,
    backupSer1, backupSer2, deleteDB, restoreFromBackup,
    currentSQL: currentScenario && currentScenario !== "custom"
      ? scenarios[currentScenario].sql
      : [],
  };
}
