// Fine calculator utility for PactTrack

export function calculateDailyFines(taskLogs, tasks) {
  let totalFine = 0;
  const fineDetails = [];
  taskLogs.forEach(log => {
    if (log.status === 'not-done') {
      const task = tasks.find(t => t.id === log.taskId);
      const fineAmount = task?.fineAmount || 10;
      totalFine += fineAmount;
      fineDetails.push({ taskId: log.taskId, taskName: task?.name || 'Unknown', amount: fineAmount, date: log.date });
    }
  });
  return { totalFine, fineDetails };
}

export function calculateMonthlyFines(fines, month) {
  return fines.filter(f => f.month === month).reduce((sum, f) => sum + f.amount, 0);
}

export function calculateTotalFines(fines) {
  return fines.reduce((sum, f) => sum + f.amount, 0);
}

export function getFineComparison(finesA, finesB, month) {
  const totalA = calculateMonthlyFines(finesA, month);
  const totalB = calculateMonthlyFines(finesB, month);
  const total = totalA + totalB || 1;
  return { userA: totalA, userB: totalB, percentA: Math.round((totalA / total) * 100), percentB: Math.round((totalB / total) * 100), mutual: totalA + totalB };
}

export function getFineTrend(fines, months) {
  return months.map(month => ({ month, total: calculateMonthlyFines(fines, month) }));
}
