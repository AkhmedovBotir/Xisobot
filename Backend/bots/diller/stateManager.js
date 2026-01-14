// In-memory state manager for bot users
// Thread-safe for Node.js single-threaded event loop
// Each user has isolated state, allowing concurrent access
// In production, consider using Redis or database for state management

const userStates = new Map();

const States = {
  NONE: 'none',
  WAITING_FOR_ISM: 'waiting_for_ism',
  WAITING_FOR_FAMILIYA: 'waiting_for_familiya',
  WAITING_FOR_PHONE: 'waiting_for_phone',
  REGISTERED: 'registered',
  ADDING_SOTUVCHI_CODE: 'adding_sotuvchi_code',
};

function getUserState(userId) {
  return userStates.get(userId) || { state: States.NONE, data: {} };
}

function setUserState(userId, state, data = {}) {
  const currentState = getUserState(userId);
  userStates.set(userId, {
    state,
    data: { ...currentState.data, ...data },
  });
}

function clearUserState(userId) {
  userStates.delete(userId);
}

function updateUserData(userId, data) {
  const currentState = getUserState(userId);
  userStates.set(userId, {
    ...currentState,
    data: { ...currentState.data, ...data },
  });
}

module.exports = {
  States,
  getUserState,
  setUserState,
  clearUserState,
  updateUserData,
};
