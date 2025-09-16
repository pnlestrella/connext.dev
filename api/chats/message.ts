import Constants from 'expo-constants';

export const sendMessage = async ({ conversationUID, senderUID, text }) => {
  return fetch(`${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/message/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationUID, senderUID, text }),
  }).then(async (res) => {
    if (!res.ok) throw await res.json();
    return res.json();
  });
};

export const getMessages = async (conversationUID) => {
  return fetch(
    `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/message/getMessages/${conversationUID}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  ).then(async (res) => {
    if (!res.ok) throw await res.json();
    return res.json();
  });
};
