export const INITIAL_DB = [
  { account_no: 1001, name: "Zilu",    balance: 2000 },
  { account_no: 2001, name: "Rudresh", balance: 1500 },
  { account_no: 3001, name: "Alice",   balance: 3000 },
];

export const scenarios = {
  normal: {
    title: "Normal Transaction",
    sql: [
      "START TRANSACTION;",
      "UPDATE Accounts SET balance = balance - 500 WHERE account_no = 1001;",
      "UPDATE Accounts SET balance = balance + 500 WHERE account_no = 2001;",
      "COMMIT;",
    ],
    steps: [
      { type: "start" },
      { type: "update", account: 1001, delta: -500 },
      { type: "update", account: 2001, delta: +500 },
      { type: "commit" },
    ],
  },
  accountNotFound: {
    title: "Transaction Failure - Account Not Found",
    sql: [
      "START TRANSACTION;",
      "UPDATE Accounts SET balance = balance - 500 WHERE account_no = 1001;",
      "UPDATE Accounts SET balance = balance + 500 WHERE account_no = 9999;",
      "ROLLBACK;",
    ],
    steps: [
      { type: "start" },
      { type: "update", account: 1001, delta: -500 },
      { type: "error", message: "ERROR: Receiver account not found", errorLine: 2 },
      { type: "rollback" },
    ],
  },
  insufficientBalance: {
    title: "Transaction Failure - Insufficient Balance",
    sql: [
      "START TRANSACTION;",
      "UPDATE Accounts SET balance = balance - 5000 WHERE account_no = 1001;",
      "UPDATE Accounts SET balance = balance + 5000 WHERE account_no = 2001;",
      "ROLLBACK;",
    ],
    steps: [
      { type: "start" },
      { type: "error", message: "ERROR: Insufficient Balance — Transaction Aborted", errorLine: 1 },
      { type: "rollback" },
    ],
  },
  systemCrash: {
    title: "System Failure (Soft Crash)",
    sql: [
      "START TRANSACTION;",
      "UPDATE Accounts SET balance = balance - 500 WHERE account_no = 1001;",
      "--  SYSTEM CRASH",
      "COMMIT;",
    ],
    steps: [
      { type: "start" },
      { type: "update", account: 1001, delta: -500 },
      { type: "crash", message: "SYSTEM CRASH DETECTED\nVolatile memory lost" },
      { type: "recovery", phase: "undo" },
    ],
  },
  mediaFailure: {
    title: "Media Failure (Disk Crash)",
    sql: [
      "--  MEDIA FAILURE DETECTED",
      "-- Database files corrupted",
      "-- Restoring from backup...",
      'mysqldump -u root -p bank_db > backup.sql',
      'mysql -u root -p bank_db < backup.sql',
    ],
    steps: [
      { type: "mediaFailure" },
      { type: "restore" },
    ],
  },
  atomicity: {
    title: "Atomicity Demonstration",
    sql: [
      "START TRANSACTION;",
      "UPDATE Accounts SET balance = balance - 100 WHERE account_no = 1001;",
      "-- ERROR OCCURS",
      "ROLLBACK;",
    ],
    steps: [
      { type: "start" },
      { type: "update", account: 1001, delta: -100 },
      { type: "error", message: "ERROR: Atomicity violated — partial update detected", errorLine: 2 },
      { type: "rollback", message: "Atomicity rule enforced: partial updates are not allowed." },
    ],
  },
  durability: {
    title: "Durability Demonstration",
    sql: [
      "START TRANSACTION;",
      "UPDATE Accounts SET balance = balance + 1000 WHERE account_no = 1001;",
      "COMMIT;",
      "-- Simulate post-commit crash",
      "-- Recovery: REDO committed transaction",
    ],
    steps: [
      { type: "start" },
      { type: "update", account: 1001, delta: +1000 },
      { type: "commit" },
      { type: "crash", message: "Post-Commit Crash Simulated" },
      { type: "recovery", phase: "redo" },
    ],
  },
};
