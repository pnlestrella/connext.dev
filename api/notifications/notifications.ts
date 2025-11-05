import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

// Get notifications for a specific user (employer or jobseeker)
export const getNotifications = async (receiverUID: string, role :string) => {
  try {
    const response = await fetch(`${API_URL}/api/notifications/getNotifications/${receiverUID}?role=${role}`);
    const data = await response.json();

    if (!data.success) {
      console.error("❌ Failed to fetch notifications:", data.error || data.message);
      return [];
    }
    // Return the list of notifications
    return data.notifications;
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    throw error;
  }
};


export const updateNotification = async (
  notificationUID: string,
  updateData: Object
) => {
  try {
    const response = await fetch(`${API_URL}/api/notifications/updateNotification/${notificationUID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (!data.success) {
      console.error('❌ Failed to update notification:', data.error || data.message);
      return null;
    }

    return data.notification;
  } catch (error) {
    console.error('❌ Error updating notification:', error);
    throw error;
  }
};