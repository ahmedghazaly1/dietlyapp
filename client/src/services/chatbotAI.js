const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function generateChatResponse(userMessage, conversationHistory = []) {
  try {
    const response = await fetch(`${API_URL}/api/v1/chatbot/message`, {
      message: userMessage,
      conversationHistory: conversationHistory,
    });

    const data = response.data;

    if (data.success) {
      return data.response;
    } else {
      throw new Error(data.error || "Failed to get response");
    }
  } catch (error) {
    console.error("Chatbot API error:", error);
    return getFallbackResponse(userMessage);
  }
}

// Enhanced fallback responses
function getFallbackResponse(userMessage) {
  const message = userMessage.toLowerCase();

  if (message.includes("weight") && message.includes("loss")) {
    return "For healthy weight loss, focus on a calorie deficit with nutrient-rich foods. Our meal library has many delicious, low-calorie options perfect for your journey!";
  } else if (message.includes("protein")) {
    return "Great question! Excellent protein sources include chicken, fish, eggs, Greek yogurt, and legumes. Check our high-protein recipes in the meal library!";
  } else if (message.includes("meal") && message.includes("plan")) {
    return "I'd love to help with meal planning! Our AI can generate personalized weekly plans based on your goals. Try creating one in the 'Meal Plans' section!";
  } else if (message.includes("healthy") || message.includes("diet")) {
    return "A balanced diet includes vegetables, lean proteins, whole grains, and healthy fats. Browse our nutritionist-approved recipes for meal ideas!";
  } else if (message.includes("hello") || message.includes("hi")) {
    return "Hello! I'm your Dietly AI Coach. I can help with nutrition advice, meal planning, and healthy eating tips. What would you like to know?";
  }

  return "I'm here to help with nutrition and meal planning! Ask me about healthy eating, weight management, or browse our 400+ meal recipes for inspiration.";
}