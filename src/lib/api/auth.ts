const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// Login user and fetch their data
export async function loginUser(identifier: string, password: string) {
  try {
    // Authenticate and get the JWT
    const loginRes = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      throw new Error(loginData.error?.message || "Invalid credentials");
    }

    const { jwt } = loginData;

    // Fetch the user's data again, but this time ask Strapi to populate the role
    const userRes = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    const userData = await userRes.json();

    if (!userRes.ok) {
      throw new Error("Failed to fetch user role");
    }

    // Format the data to match your Redux authSlice structure
    return {
      jwt,
      user: {
        id: userData.id,
        username: userData.username,
        documentId: userData.documentId,
        email: userData.email,
        role: userData.role?.name || "Student",
      },
    };
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong during login");
  }
}

// Register a new user
export async function registerUser(
  username: string,
  email: string,
  password: string,
) {
  try {
    // Hit Strapi's default registration endpoint
    const registerRes = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const registerData = await registerRes.json();

    if (!registerRes.ok) {
      throw new Error(registerData.error?.message || "Registration failed");
    }

    const { jwt } = registerData;

    // Fetch the user's data again to populate the role relation
    const userRes = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    const userData = await userRes.json();

    if (!userRes.ok) {
      throw new Error("Failed to fetch user role");
    }

    return {
      jwt,
      user: {
        id: userData.id,
        username: userData.username,
        documentId: userData.documentId,
        email: userData.email,
        role: userData.role?.name || "Student",
      },
    };
  } catch (error: any) {
    throw new Error(
      error.message || "Something went wrong during registration",
    );
  }
}
