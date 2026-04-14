// utils/storage.js
// Database layer — Firebase Firestore (primary) with localStorage fallback for
// session data (current user, API key) that never needs cross-device sync.

window.StorageDB = (() => {
  /* ─────────────────────────────────────────────────────────────
     Firestore helpers
  ───────────────────────────────────────────────────────────── */
  const db = () => window._db;

  const usersCol    = () => db().collection("users");
  const coursesCol  = () => db().collection("courses");
  const userDataCol = () => db().collection("userData");

  /* ─────────────────────────────────────────────────────────────
     Local-only session helpers (never synced — intentional)
  ───────────────────────────────────────────────────────────── */
  const getCurrentUser = () => {
    try { return JSON.parse(localStorage.getItem("aether_current_user")); }
    catch { return null; }
  };

  const setCurrentUser = (user) => {
    if (user) localStorage.setItem("aether_current_user", JSON.stringify(user));
    else       localStorage.removeItem("aether_current_user");
  };

  const getSavedAccounts = () => {
    try {
      const a = JSON.parse(localStorage.getItem("aether_saved_accounts") || "[]");
      return Array.isArray(a) ? a : [];
    } catch { return []; }
  };

  const saveAccount = (user) => {
    try {
      if (!user?.email) return;
      const accounts = getSavedAccounts();
      const idx = accounts.findIndex(a => a.email === user.email);
      if (idx >= 0) accounts[idx] = user; else accounts.push(user);
      localStorage.setItem("aether_saved_accounts", JSON.stringify(accounts));
    } catch (e) { console.error("saveAccount:", e); }
  };

  const removeAccount = (email) => {
    try {
      const filtered = getSavedAccounts().filter(a => a.email !== email);
      localStorage.setItem("aether_saved_accounts", JSON.stringify(filtered));
    } catch (e) { console.error("removeAccount:", e); }
  };

  const getApiKey = () => {
    try { return localStorage.getItem("aether_api_key") || ""; }
    catch { return ""; }
  };

  const setApiKey = (key) => {
    if (key) localStorage.setItem("aether_api_key", key);
    else     localStorage.removeItem("aether_api_key");
  };

  /* ─────────────────────────────────────────────────────────────
     Users (Firestore)
  ───────────────────────────────────────────────────────────── */
  const getUsers = async () => {
    try {
      const snap = await usersCol().get();
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.error("getUsers:", e);
      return [];
    }
  };

  const saveUser = async (user) => {
    try {
      if (!user?.email) throw new Error("user.email required");
      await usersCol().doc(user.email).set(user, { merge: true });
    } catch (e) {
      console.error("saveUser:", e);
      throw new Error("Failed to save user");
    }
  };

  const getUserByEmail = async (email) => {
    try {
      const doc = await usersCol().doc(email.toLowerCase()).get();
      return doc.exists ? doc.data() : null;
    } catch (e) {
      console.error("getUserByEmail:", e);
      return null;
    }
  };

  /* ─────────────────────────────────────────────────────────────
     Courses catalogue (Firestore)
  ───────────────────────────────────────────────────────────── */
  const getAllCourses = async () => {
    try {
      const snap = await coursesCol().get();
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.error("getAllCourses:", e);
      return [];
    }
  };

  const addCourse = async (course) => {
    try {
      if (course.id == null) throw new Error("course.id required");
      await coursesCol().doc(String(course.id)).set(course, { merge: true });
    } catch (e) {
      console.error("addCourse:", e);
      throw new Error("Failed to save course");
    }
  };

  const deleteCourseById = async (courseId) => {
    try {
      await coursesCol().doc(String(courseId)).delete();
    } catch (e) {
      console.error("deleteCourseById:", e);
      throw new Error("Failed to delete course");
    }
  };

  /* ─────────────────────────────────────────────────────────────
     Per-user data (Firestore)
     Each user's data lives in userData/<email> as a single doc
     with fields: myCourses, stats, aiTutorUsed, chatHistory, courseRatings
  ───────────────────────────────────────────────────────────── */
  const _getUserDoc = async (email) => {
    try {
      const doc = await userDataCol().doc(email).get();
      return doc.exists ? doc.data() : null;
    } catch (e) {
      console.error("_getUserDoc:", e);
      return null;
    }
  };

  const _setUserField = async (email, field, value) => {
    try {
      await userDataCol().doc(email).set({ [field]: value }, { merge: true });
    } catch (e) {
      console.error(`_setUserField(${field}):`, e);
      throw new Error(`Failed to save ${field}`);
    }
  };

  const getMyCourses = async (email) => {
    const data = await _getUserDoc(email);
    return data?.myCourses || [];
  };

  const setMyCourses = async (email, courses) => {
    await _setUserField(email, "myCourses", courses);
  };

  const getStats = async (email) => {
    const data = await _getUserDoc(email);
    return data?.stats || [];
  };

  const setStats = async (email, stats) => {
    await _setUserField(email, "stats", stats);
  };

  const getAITutorUsed = async (email) => {
    const data = await _getUserDoc(email);
    return !!data?.aiTutorUsed;
  };

  const markAITutorUsed = async (email) => {
    await _setUserField(email, "aiTutorUsed", true);
  };

  const getChatHistory = async (email) => {
    const data = await _getUserDoc(email);
    return data?.chatHistory || [];
  };

  const setChatHistory = async (email, messages) => {
    await _setUserField(email, "chatHistory", messages);
  };

  /* ─────────────────────────────────────────────────────────────
     Enrollment counts  (Firestore — reads all userData docs)
  ───────────────────────────────────────────────────────────── */
  const getCourseEnrollments = async (courseId) => {
    try {
      const snap = await userDataCol().get();
      let count = 0;
      snap.docs.forEach(doc => {
        const courses = doc.data()?.myCourses || [];
        if (courses.some(c => String(c.id) === String(courseId))) count++;
      });
      return count;
    } catch (e) {
      console.error("getCourseEnrollments:", e);
      return 0;
    }
  };

  /* ─────────────────────────────────────────────────────────────
     Course ratings  (stored inside userData/<email>.courseRatings)
  ───────────────────────────────────────────────────────────── */
  const getCourseRating = async (courseId) => {
    try {
      const snap = await userDataCol().get();
      let total = 0, count = 0;
      snap.docs.forEach(doc => {
        const ratings = doc.data()?.courseRatings || {};
        if (ratings[courseId]) { total += ratings[courseId]; count++; }
      });
      return count > 0 ? (total / count).toFixed(1) : "0.0";
    } catch (e) {
      console.error("getCourseRating:", e);
      return "0.0";
    }
  };

  const setUserCourseRating = async (email, courseId, rating) => {
    try {
      const data = await _getUserDoc(email);
      const ratings = { ...(data?.courseRatings || {}), [courseId]: Number(rating) };
      await _setUserField(email, "courseRatings", ratings);
    } catch (e) {
      console.error("setUserCourseRating:", e);
    }
  };

  const getUserCourseRating = async (email, courseId) => {
    try {
      const data = await _getUserDoc(email);
      return data?.courseRatings?.[courseId] || 0;
    } catch (e) {
      console.error("getUserCourseRating:", e);
      return 0;
    }
  };

  /* ─────────────────────────────────────────────────────────────
     Legacy compatibility shim
  ───────────────────────────────────────────────────────────── */
  const isTrickleEnv = () => false;

  return {
    isTrickleEnv,
    getCurrentUser,
    setCurrentUser,
    getSavedAccounts,
    saveAccount,
    removeAccount,
    getApiKey,
    setApiKey,
    getUsers,
    saveUser,
    getUserByEmail,
    getAllCourses,
    addCourse,
    deleteCourseById,
    getMyCourses,
    setMyCourses,
    getStats,
    setStats,
    getAITutorUsed,
    markAITutorUsed,
    getChatHistory,
    setChatHistory,
    getCourseEnrollments,
    getCourseRating,
    setUserCourseRating,
    getUserCourseRating,
  };
})();
