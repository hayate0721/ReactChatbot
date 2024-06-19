import { useState } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = import.meta.env.VITE_API_KEY;

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT!",
      sender: "ChatGPT", // corrected from 'semder' to 'sender'
      direction: "incoming"
    }
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    };

    const newMessages = [...messages, newMessage]; // all the old messages + the new message

    // update our message state
    setMessages(newMessages);

    // set a typing indicator (chatgpt is typing)
    setTyping(true);

    // process message to chatGPT (send it over and see the response)
    await processMessageToChatGPT(newMessages);
  }

  async function processMessageToChatGPT(chatMessages) {
    // chatMessages {sender: "user" or "ChatGPT", message: "The message content here"}
    // apiMessages {role: "user" or "assistant", content: "The message content here"}

    let apiMessages = chatMessages.map((messageObject) => { // corrected from 'apiMessage' to 'apiMessages'
      let role = "";
      if (messageObject.sender === "ChatGPT") { // corrected from 'messageObhect' to 'messageObject'
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message }
    });

    // role: "user" -> a message from the user, "assistant" -> a response from ChatGPT
    // "system" -> generally one initial message defining how we want ChatGPT to talk

    const systemMessage = {
      role: "system",
      content: "Talk like a cat."
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages // corrected from 'apiMessage' to 'apiMessages'
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      const responseMessage = {
        message: data.choices[0].message.content,
        sender: "ChatGPT",
        direction: "incoming"
      };

      setMessages([...chatMessages, responseMessage]);
      setTyping(false);
    }).catch((error) => {
      console.error("Error:", error);
      setTyping(false);
    });
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder='Type message here' onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
