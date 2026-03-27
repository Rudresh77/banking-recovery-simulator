export const INITIAL_DB = [
  { id: "B001", title: "Database Systems",  author: "Silberschatz", copies: 5 },
  { id: "B002", title: "Data Structures",   author: "Cormen",       copies: 3 },
  { id: "B003", title: "Operating Systems", author: "Tanenbaum",    copies: 4 },
];

export const scenarios = {
  normal: {
    title: "Normal Transaction",
    sql: [
      "START TRANSACTION;",
      "UPDATE Books SET copies = copies - 1 WHERE book_id = 'B001';",
      "UPDATE Books SET copies = copies - 1 WHERE book_id = 'B002';",
      "COMMIT;",
    ],
    steps: [
      { type: "start" },
      { type: "update", id: "B001", delta: -1 },
      { type: "update", id: "B002", delta: -1 },
      { type: "commit" },
    ],
  },
  notFound: {
    title: "Transaction Failure - Book Not Found",
    sql: [
      "START TRANSACTION;",
      "UPDATE Books SET copies = copies - 1 WHERE book_id = 'B001';",
      "UPDATE Books SET copies = copies - 1 WHERE book_id = 'B999';",
      "-- ERROR: Book not found -> ROLLBACK",
    ],
    steps: [
      { type: "start" },
      { type: "update", id: "B001", delta: -1 },
      { type: "error", message: "ERROR: Book B999 not found in database. Transaction aborted.", errorLine: 2 },
    ],
  },
  systemCrash: {
    title: "System Crash (Soft Crash)",
    sql: [
      "START TRANSACTION;",
      "UPDATE Books SET copies = copies - 1 WHERE book_id = 'B001';",
      "-- SYSTEM CRASH (power failure)",
      "COMMIT; -- never reached",
    ],
    steps: [
      { type: "start" },
      { type: "update", id: "B001", delta: -1 },
      { type: "crash", message: "SYSTEM CRASH DETECTED" },
      { type: "recovery", phase: "undo" },
    ],
  },
  mediaFailure: {
    title: "Media Failure (Disk Crash)",
    sql: [
      "-- MEDIA FAILURE DETECTED",
      "-- Database files corrupted",
      "-- Restoring from backup_ser2.sql...",
      "mysqldump -u root -p lib_db > backup_ser2.sql",
      "mysql -u root -p lib_db < backup_ser2.sql",
    ],
    steps: [
      { type: "mediaFailure" },
      { type: "restore" },
    ],
  },
  durability: {
    title: "Durability Demonstration (REDO)",
    sql: [
      "START TRANSACTION;",
      "UPDATE Books SET copies = copies + 1 WHERE book_id = 'B003';",
      "COMMIT;",
      "-- Post-commit crash simulation",
      "-- REDO: reapply committed transaction",
    ],
    steps: [
      { type: "start" },
      { type: "update", id: "B003", delta: +1 },
      { type: "commit" },
      { type: "crash", message: "Post-Commit Crash Simulated" },
      { type: "recovery", phase: "redo" },
    ],
  },
};
