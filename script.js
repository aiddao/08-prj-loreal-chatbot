/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Conversation history should persist across submits
let messages = [
  {
    role: "system",
    content: `You are a friendly sales agent for L'Oreal and you have extensive knowledge of L'Oreal's products. You help users find the products they want for any occasion, any price range, and any quality. You can also help users find the best products for their skin type, hair type, and any other specific needs they may have. You are also trained in how to use each product and can provide detailed instructions on how to use them. You are also trained in how to combine different products to create the best results for the user.

    If a user's query is unrelated to L'Oreal products, routines, or recommendations, respond by stating that you do not know.`,
  },
];

// REPLACE with your actual Cloudflare Worker URL
const workerUrl = "https://loreal-chat-bot.aidendao.workers.dev/";

// Creates one chat bubble and appends it to the chat window
function addMessageBubble(role, text) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("msg");
  const labelElement = document.createElement("strong");
  const textElement = document.createElement("span");

  if (role === "user") {
    messageElement.classList.add("user");
    labelElement.textContent = "You: ";
  } else {
    messageElement.classList.add("ai");
    labelElement.textContent = "L'Oreal Bot: ";
  }

  textElement.textContent = text;
  messageElement.appendChild(labelElement);
  messageElement.appendChild(textElement);

  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return messageElement;
}

// Set initial message
addMessageBubble("assistant", "Hello! How can I help you today?");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Show the user's message as a chat bubble
  addMessageBubble("user", userMessage);

  // Clear the input field
  userInput.value = "";
  // Keep conversation history and send it to the worker
  messages.push({ role: "user", content: userMessage });

  // Show a temporary assistant bubble while waiting for the API response
  const thinkingBubble = addMessageBubble("assistant", "Thinking...");

  try {
    // Send a POST request to your Cloudflare Worker
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    // Check if the response is not ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON response from the Cloudflare Worker
    const result = await response.json();

    // Get the reply from OpenAI's response structure
    const replyText = result.choices[0].message.content;

    // Add the worker's response to the conversation history
    messages.push({ role: "assistant", content: replyText });

    // Remove the temporary thinking bubble and show the real response
    thinkingBubble.remove();

    // Show the assistant's message as a chat bubble
    addMessageBubble("assistant", replyText);
  } catch (error) {
    console.error("Error:", error); // Log the error

    // Remove the temporary thinking bubble and show an error message
    thinkingBubble.remove();
    addMessageBubble(
      "assistant",
      "Sorry, something went wrong. Please try again later.",
    );
  }
});
