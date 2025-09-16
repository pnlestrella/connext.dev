import Constants from 'expo-constants';

export const createConversation = async (employerUID: string, seekerUID: string) => {
  try {
    const res = await fetch(
      `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/conversation/createConversation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employerUID,
          seekerUID,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to create conversation: ${res.status}`);
    }

    const data = await res.json();
    return data; // contains { success: true, payload: conversation }
  } catch (err) {
    console.error('Error creating conversation:', err);
    throw err;
  }
};

// Get all conversations for a user
export const getUserConversations = async (userUID: string) => {
  try {
    const res = await fetch(
      `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/conversation/getUserConversations/${userUID}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch conversations: ${res.status}`);
    }


    return await res.json(); // returns the array of conversations
  } catch (err) {
    console.error('Error fetching conversations:', err);
    throw err;
  }
};
