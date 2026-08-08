const API_BASE_URL = "https://mechanic-app-v2.onrender.com";

export async function createService(serviceData) {
  const response = await fetch(`${API_BASE_URL}/service`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(serviceData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to save service");
  }

  return response.json();
}

export async function getRecentServices() {
  const response = await fetch(`${API_BASE_URL}/recent-services`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error || "Failed to load recent services"
    );
  }

  return response.json();
}

export async function getDueServices() {
  const response = await fetch(`${API_BASE_URL}/due-services`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error || "Failed to load due services"
    );
  }

  return response.json();
}


