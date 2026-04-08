/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // When using Cloudflare, you'll need to POST a `messages` array in the body,
  // and handle the response using: data.choices[0].message.content

  // Initialize an array to keep track of the conversation history
  let messages = [
    {
      role: "system",
      content: `You are a friendly sales agent for L'Oreal and you have extensive knowledge of L'Oreal's products. You help users find the products they want for any occasion, any price range, and any quality. You can also help users find the best products for their skin type, hair type, and any other specific needs they may have. You are also trained in how to use each product and can provide detailed instructions on how to use them. You are also trained in how to combine different products to create the best results for the user.

      If a user's query is unrelated to L'Oreal products, routines, or recommendations, respond by stating that you do not know.`,
    },
  ];

  // REPLACE with your actual Cloudflare Worker URL
  const workerUrl = "https://loreal-chat-bot.aidendao.workers.dev/";

  // Add event listener to the form
  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the form from submitting the traditional way
    chatWindow.textContent = "Thinking..."; // Display a loading message

    // Add the user's message to the conversation history
    messages.push({ role: "user", content: userInput.value });

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

      // Add the Worker's response to the conversation history
      messages.push({ role: "assistant", content: replyText });

      // Display the response on the page with bold speaker labels
      chatWindow.innerHTML =
        "<strong>You:</strong> " + userInput.value + "<br><br><strong>L'Oreal Bot:</strong> " + replyText;
    } catch (error) {
      console.error("Error:", error); // Log the error
      chatWindow.textContent =
        "Sorry, something went wrong. Please try again later."; // Show error message to the user
    }

    // Clear the input field
    userInput.value = "";
  });
});
