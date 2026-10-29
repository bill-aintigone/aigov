const KEY = "aigov-react-v1";

export function loadAssessment() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");

    if (
      !saved ||
      saved.version !== 1 ||
      !saved.data ||
      typeof saved.data !== "object" ||
      Array.isArray(saved.data)
    ) {
      return null;
    }

    return saved;
  } catch {
    return null;
  }
}

export function saveAssessment(snapshot) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ version: 1, ...snapshot }),
    );
  } catch {
    // Η εφαρμογή συνεχίζει χωρίς αποθήκευση.
  }
}