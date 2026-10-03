
export function infraredAbortProcess(reason, detail) {
  process._rawDebug(JSON.stringify({
    event: "infrared_core_worker_failed", outcome: "process_aborted", reason, error: detail,
  }));
  // SIGKILL: a host handler cannot catch it and resume the broken core.
  process.kill(process.pid, "SIGKILL");
}
