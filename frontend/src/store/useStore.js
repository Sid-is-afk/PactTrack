import { create } from 'zustand';
import { todayIST, currentMonthIST, needsDailyReset } from '../utils/dateHelpers';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

const useStore = create(
    (set, get) => ({
      isLoading: false,
      error: null,

      fetchInitialData: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiGet(`/users/${userId}`);
          set({
            tasks: data.tasks || [],
            taskLogs: data.taskLogs || [],
            goals: data.goals || [],
            goalLogs: data.goalLogs || [],
            fines: data.fines || [],
            piggyBanks: data.piggyBanks?.[0] || {}, // Prisma returns array if not unique, but we made it unique
            reactions: data.reactions || [],
            comments: data.comments || [],
            weeklyResults: data.weeklyResults || [],
            achievements: data.achievements || [],
            userChallenges: data.challenges || [],
            xp: data.xp || 0,
            level: data.level || 1,
            theme: data.theme || 'light',
            lastResetDate: data.lastResetDate,
            isLoading: false
          });
        } catch (err) {
          set({ error: err.message, isLoading: false });
        }
      },

      // ── Tasks (weekly schedule) ──
      tasks: [],
      addTask: async (task) => {
        try {
          const newTask = await apiPost('/tasks', { fineAmount: 10, isPrivate: false, goalId: null, ...task });
          set(s => ({ tasks: [...s.tasks, newTask] }));
        } catch (err) {
          set({ error: err.message });
        }
      },
      updateTask: async (id, updates) => {
        try {
          const updatedTask = await apiPut(`/tasks/${id}`, updates);
          set(s => ({ tasks: s.tasks.map(t => t.id === id ? updatedTask : t) }));
        } catch (err) {
          set({ error: err.message });
        }
      },
      deleteTask: async (id) => {
        try {
          await apiDelete(`/tasks/${id}`);
          set(s => {
            const logsToRemove = s.taskLogs.filter(l => l.taskId === id).map(l => l.id);
            return {
              tasks: s.tasks.filter(t => t.id !== id),
              taskLogs: s.taskLogs.filter(l => l.taskId !== id),
              fines: s.fines.filter(f => !logsToRemove.includes(f.taskLogId))
            };
          });
        } catch (err) {
          set({ error: err.message });
        }
      },
      copyDayTasks: async (userId, fromDay, toDays) => {
        const { tasks } = get();
        const sourceTasks = tasks.filter(t => t.userId === userId && t.daysOfWeek.includes(fromDay));
        for (const day of toDays) {
          for (const st of sourceTasks) {
            const exists = tasks.some(t => t.userId === userId && t.name === st.name && t.daysOfWeek.includes(day));
            if (!exists) {
              const { id, createdAt, updatedAt, ...taskData } = st;
              await get().addTask({ ...taskData, daysOfWeek: [day] });
            }
          }
        }
      },

      // ── Task Logs ──
      taskLogs: [],
      setTaskStatus: async (taskId, userId, date, status) => {
        try {
          await apiPost('/task-logs/status', { taskId, userId, date, status });
          // Re-fetch to ensure logs and fines are in sync (since backend creates/deletes fines)
          const data = await apiGet(`/users/${userId}`);
          set({ taskLogs: data.taskLogs, fines: data.fines });
        } catch (err) {
          set({ error: err.message });
        }
      },
      carryForward: async (taskLogId, newDate) => {
        try {
          const updatedLog = await apiPut(`/task-logs/${taskLogId}/carry-forward`, { newDate });
          set(s => ({
            taskLogs: s.taskLogs.map(l => l.id === taskLogId ? updatedLog : l),
          }));
        } catch (err) {
          set({ error: err.message });
        }
      },
      rescheduleTask: async (taskLogId, newDate) => {
        try {
          const updatedLog = await apiPut(`/task-logs/${taskLogId}/carry-forward`, { newDate });
          set(s => ({
            taskLogs: s.taskLogs.map(l => l.id === taskLogId ? updatedLog : l),
          }));
        } catch (err) {
          set({ error: err.message });
        }
      },

      // ── Fines ──
      fines: [],

      // ── Piggy Banks ──
      piggyBanks: {},
      setPiggyBankPurpose: async (userId, purpose) => {
        try {
          const pb = await apiPost('/piggy-banks/purpose', { purpose });
          set(s => ({ piggyBanks: { ...s.piggyBanks, [userId]: pb } }));
        } catch (err) {
          set({ error: err.message });
        }
      },

      // ── Goals ──
      goals: [],
      addGoal: async (goal) => {
        try {
          const newGoal = await apiPost('/goals', goal);
          set(s => ({ goals: [...s.goals, newGoal] }));
        } catch (err) {
          set({ error: err.message });
        }
      },
      updateGoal: async (id, updates) => {
        try {
          const updatedGoal = await apiPut(`/goals/${id}`, updates);
          set(s => ({ goals: s.goals.map(g => g.id === id ? updatedGoal : g) }));
        } catch (err) {
          set({ error: err.message });
        }
      },
      deleteGoal: async (id) => {
        try {
          await apiDelete(`/goals/${id}`);
          set(s => ({ goals: s.goals.filter(g => g.id !== id) }));
        } catch (err) {
          set({ error: err.message });
        }
      },
      linkTaskToGoal: async (taskId, goalId) => {
        try {
          await apiPut(`/tasks/${taskId}`, { goalId });
          const data = await apiGet(`/users/${get().tasks.find(t => t.id === taskId).userId}`);
          set({ tasks: data.tasks, goals: data.goals });
        } catch (err) {
          set({ error: err.message });
        }
      },
      goalLogs: [],
      toggleGoalLog: async (goalId, date) => {
        try {
          const res = await apiPost(`/goals/${goalId}/toggle-log`, { date });
          if (res.status === 'marked') {
            set(s => ({ goalLogs: [...s.goalLogs, res.log] }));
          } else {
            set(s => ({ goalLogs: s.goalLogs.filter(l => !(l.goalId === goalId && l.date === date)) }));
          }
        } catch (err) {
          set({ error: err.message });
        }
      },

      // ── Reactions ──
      reactions: [],
      toggleReaction: async (fromUserId, taskLogId, emoji) => {
        try {
          await apiPost('/reactions/toggle', { taskLogId, emoji });
          const data = await apiGet(`/users/${fromUserId}`);
          set({ reactions: data.reactions });
        } catch (err) {
          set({ error: err.message });
        }
      },

      // ── Comments ──
      comments: [],
      addComment: async (fromUserId, taskLogId, text) => {
        try {
          const newComment = await apiPost('/comments', { taskLogId, text });
          set(s => ({ comments: [...s.comments, newComment] }));
        } catch (err) {
          set({ error: err.message });
        }
      },
      deleteComment: async (id) => {
        try {
          await apiDelete(`/comments/${id}`);
          set(s => ({ comments: s.comments.filter(c => c.id !== id) }));
        } catch (err) {
          set({ error: err.message });
        }
      },

      // ── Weekly Results ──
      weeklyResults: [],
      addWeeklyResult: async (result) => {
        try {
          const newResult = await apiPost('/weekly-results', result);
          set(s => ({ weeklyResults: [...s.weeklyResults, newResult] }));
        } catch (err) {
          set({ error: err.message });
        }
      },

      // ── Settings ──
      theme: 'light',
      lastResetDate: null,
      lastWeeklyReview: null,
      weeklyReviewDismissed: false,
      updateUserSettings: async (updates) => {
        const { tasks } = get();
        const userId = tasks[0]?.userId; // Fallback to finding userId from tasks or useAuth
        if (!userId) return; 
        try {
          const updatedUser = await apiPut(`/users/${userId}`, updates);
          set({ theme: updatedUser.theme, lastResetDate: updatedUser.lastResetDate });
        } catch (err) {
          set({ error: err.message });
        }
      },
      toggleTheme: async () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        await get().updateUserSettings({ theme: newTheme });
      },
      setLastResetDate: async (date) => {
        await get().updateUserSettings({ lastResetDate: date });
      },
      setWeeklyReviewDismissed: (val) => set({ weeklyReviewDismissed: val, lastWeeklyReview: todayIST() }),

      // ── Daily Reset ──
      performDailyReset: async () => {
        const { lastResetDate } = get();
        if (needsDailyReset(lastResetDate)) {
          await get().setLastResetDate(todayIST());
          set({ weeklyReviewDismissed: false });
        }
      },

      // ── Gamification ──
      xp: 0,
      level: 1,
      achievements: [],
      challenges: [],
      userChallenges: [],
      leaderboard: [],
      fetchGamificationData: async () => {
        try {
          const achievements = await apiGet('/gamification/achievements');
          const challenges = await apiGet('/gamification/challenges');
          const leaderboard = await apiGet('/gamification/leaderboard');
          set({ achievements, challenges, leaderboard });
        } catch (err) {
          set({ error: err.message });
        }
      },
      joinChallenge: async (challengeId) => {
        try {
          const participant = await apiPost(`/gamification/challenges/${challengeId}/join`);
          set(s => ({ userChallenges: [...s.userChallenges, participant] }));
          await get().fetchGamificationData();
        } catch (err) {
          set({ error: err.message });
        }
      },
      createChallenge: async (challengeData) => {
        try {
          const newChallenge = await apiPost('/gamification/challenges', challengeData);
          set(s => ({ challenges: [newChallenge, ...s.challenges] }));
        } catch (err) {
          set({ error: err.message });
        }
      },
    })
);

export default useStore;
