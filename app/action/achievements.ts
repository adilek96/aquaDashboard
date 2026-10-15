"use server";

// Награды живут в БД aquaDaddy, поэтому CRUD идёт через его admin-API
// (тот же токен и адрес, что и для пользователей).
const adminToken =
  process.env.ADMIN_TOKEN ?? process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY;
const apiUrl = process.env.USER_API_URL;

export type AchievementDef = {
  id: string;
  key: string;
  category: string;
  threshold: number;
  active: boolean;
};

type Result<T> = { statusCode: number; data: T | null; error: string | null };

function headers() {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
  };
}

async function parse<T>(response: Response): Promise<Result<T>> {
  if (!response.ok) {
    const text = await response.text();
    return { statusCode: response.status, data: null, error: text || "Ошибка запроса" };
  }
  const data = (await response.json()) as T;
  return { statusCode: 200, data, error: null };
}

export async function getAchievementDefs(): Promise<Result<{ defs: AchievementDef[] }>> {
  try {
    if (!apiUrl) throw new Error("USER_API_URL не настроен");
    const response = await fetch(`${apiUrl}/api/admin/achievements`, {
      headers: headers(),
      cache: "no-store",
    });
    return parse(response);
  } catch (error) {
    return {
      statusCode: 500,
      data: null,
      error: error instanceof Error ? error.message : "Не удалось загрузить награды",
    };
  }
}

export async function createAchievementDef(input: {
  category: string;
  threshold: number;
}): Promise<Result<{ def: AchievementDef }>> {
  try {
    if (!apiUrl) throw new Error("USER_API_URL не настроен");
    const response = await fetch(`${apiUrl}/api/admin/achievements`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(input),
    });
    return parse(response);
  } catch (error) {
    return {
      statusCode: 500,
      data: null,
      error: error instanceof Error ? error.message : "Не удалось создать награду",
    };
  }
}

export async function updateAchievementDef(
  id: string,
  input: { category?: string; threshold?: number; active?: boolean }
): Promise<Result<{ def: AchievementDef }>> {
  try {
    if (!apiUrl) throw new Error("USER_API_URL не настроен");
    const response = await fetch(`${apiUrl}/api/admin/achievements/${id}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(input),
    });
    return parse(response);
  } catch (error) {
    return {
      statusCode: 500,
      data: null,
      error: error instanceof Error ? error.message : "Не удалось обновить награду",
    };
  }
}

export async function deleteAchievementDef(
  id: string
): Promise<Result<{ success: boolean }>> {
  try {
    if (!apiUrl) throw new Error("USER_API_URL не настроен");
    const response = await fetch(`${apiUrl}/api/admin/achievements/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    return parse(response);
  } catch (error) {
    return {
      statusCode: 500,
      data: null,
      error: error instanceof Error ? error.message : "Не удалось удалить награду",
    };
  }
}
