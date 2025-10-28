let _config = {
  openAI_api: 'https://alcuino-chatbot.azurewebsites.net/api/OpenAIProxy',
  openAI_model: 'gpt-4o-mini',
  ai_instruction: `You are a professional anime expert and educator specializing EXCLUSIVELY in anime, manga, and Japanese animation culture.

STRICT TOPIC BOUNDARIES:
- ONLY answer questions related to: anime, manga, Japanese animation, anime characters, anime studios, voice actors, anime directors, anime genres, Japanese pop culture related to anime, anime conventions, cosplay, anime merchandise, and anime streaming platforms
- If a question is NOT about anime or related Japanese animation culture, you MUST politely decline and redirect

RESPONSE GUIDELINES FOR ANIME TOPICS:
- Provide detailed, informative responses about anime titles, characters, studios, directors, and industry trends
- Offer personalized recommendations based on user preferences
- Explain anime terminology, cultural context, and production aspects
- Discuss plot details, themes, and artistic elements professionally
- Share information about streaming platforms, release dates, and viewing options
- Always respond in clear, structured HTML format
- Use proper HTML tags: <p>, <strong>, <ul>, <li>, <br> for formatting
- Never use markdown syntax
- Keep responses informative yet concise
- Maintain a professional, knowledgeable tone

RESPONSE FOR NON-ANIME TOPICS:
When asked about anything unrelated to anime/manga/Japanese animation, respond with:
<p>I apologize, but I specialize exclusively in anime, manga, and Japanese animation topics. I'm not able to answer questions about [topic mentioned].</p>
<p><strong>I can help you with:</strong></p>
<ul>
<li>Anime recommendations and information</li>
<li>Manga discussions</li>
<li>Character and plot analysis</li>
<li>Studio and production details</li>
<li>Streaming platforms and where to watch</li>
</ul>
<p>Is there anything anime-related you'd like to know about?</p>

EXAMPLE ANIME RESPONSE FORMAT:
<p><strong>Attack on Titan</strong> is a critically acclaimed dark fantasy anime series.</p>
<p><strong>Key Information:</strong></p>
<ul>
<li>Studio: MAPPA (Final Season), Wit Studio (Seasons 1-3)</li>
<li>Genre: Dark Fantasy, Action, Drama</li>
<li>Episodes: 87 (Complete)</li>
</ul>`,
  response_id: '',
}

class AnimeBot {
  constructor() {
    this.chatMessages = document.getElementById('chatMessages')
    this.userInput = document.getElementById('userInput')
    this.sendButton = document.getElementById('sendButton')

    this.initialize()
  }

  initialize() {
    this.setupEventListeners()
    this.showWelcomeMessage()
    this.userInput.focus()
  }

  setupEventListeners() {
    this.userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    })
    this.sendButton.addEventListener('click', () => this.sendMessage())
  }

  async sendOpenAIRequest(text) {
    let requestBody = {
      model: _config.openAI_model,
      input: text,
      instructions: _config.ai_instruction,
      previous_response_id: _config.response_id,
    }

    if (_config.response_id.length == 0) {
      requestBody = {
        model: _config.openAI_model,
        input: text,
        instructions: _config.ai_instruction,
      }
    }

    try {
      const response = await fetch(_config.openAI_api, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log(data)
      let output = data.output[0].content[0].text
      _config.response_id = data.id

      return output
    } catch (error) {
      console.error('Error calling OpenAI API:', error)
      throw error
    }
  }

  async sendMessage() {
    const message = this.userInput.value.trim()

    if (!message) return

    this.addMessage(message, 'user')
    this.userInput.value = ''
    this.userInput.disabled = true
    this.sendButton.disabled = true
    this.showTyping()

    try {
      const response = await this.sendOpenAIRequest(message)
      this.hideTyping()
      this.addMessage(response, 'bot')
    } catch (error) {
      this.hideTyping()
      this.addMessage(
        '<p>I apologize, but I encountered an error processing your request. Please try again.</p>',
        'bot'
      )
      console.error('Error processing message:', error)
    } finally {
      this.userInput.disabled = false
      this.sendButton.disabled = false
      this.userInput.focus()
    }
  }

  addMessage(content, sender) {
    const messageDiv = document.createElement('div')
    messageDiv.className = `message ${sender}-message`

    // Create wrapper for content and time
    const messageWrapper = document.createElement('div')
    messageWrapper.className = 'message-wrapper'

    const contentDiv = document.createElement('div')
    contentDiv.className = 'message-content'
    contentDiv.innerHTML = content

    const timeDiv = document.createElement('div')
    timeDiv.className = 'message-time'
    timeDiv.textContent = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    messageWrapper.appendChild(contentDiv)
    messageWrapper.appendChild(timeDiv)

    // For bot messages: avatar first, then content
    if (sender === 'bot') {
      const avatarDiv = document.createElement('div')
      avatarDiv.className = 'message-avatar'
      avatarDiv.innerHTML = '<img src="images/anime.png" alt="Bot">'
      messageDiv.appendChild(avatarDiv)
      messageDiv.appendChild(messageWrapper)
    }

    // For user messages: content first, then avatar
    if (sender === 'user') {
      messageDiv.appendChild(messageWrapper)
      const avatarDiv = document.createElement('div')
      avatarDiv.className = 'message-avatar'
      avatarDiv.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="4" fill="currentColor"/>
        <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`
      messageDiv.appendChild(avatarDiv)
    }

    this.chatMessages.appendChild(messageDiv)

    this.scrollToBottom()
  }

  showTyping() {
    const typingDiv = document.createElement('div')
    typingDiv.className = 'message bot-message typing-indicator'
    typingDiv.id = 'typing-indicator'

    // Add bot avatar to typing indicator
    const avatarDiv = document.createElement('div')
    avatarDiv.className = 'message-avatar'
    avatarDiv.innerHTML = '<img src="images/anime.png" alt="Bot">'
    typingDiv.appendChild(avatarDiv)

    const contentDiv = document.createElement('div')
    contentDiv.className = 'message-content'
    contentDiv.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="typing-text">Processing your query...</div>
        `

    typingDiv.appendChild(contentDiv)
    this.chatMessages.appendChild(typingDiv)
    this.scrollToBottom()
  }

  hideTyping() {
    const typingIndicator = document.getElementById('typing-indicator')
    if (typingIndicator) {
      typingIndicator.remove()
    }
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight
  }

  showWelcomeMessage() {
    setTimeout(() => {
      this.addMessage(
        '<p><strong>Welcome to Anime Intelligence Assistant</strong></p>' +
          "<p>I'm your professional anime expert powered by OpenAI. I can help you with:</p>" +
          '<ul>' +
          '<li>Detailed anime and manga information</li>' +
          '<li>Personalized recommendations based on your taste</li>' +
          '<li>Character analysis and plot discussions</li>' +
          '<li>Studio history and production insights</li>' +
          '<li>Streaming availability and release schedules</li>' +
          '</ul>' +
          "<p>Ask me anything about anime and I'll provide comprehensive, professional insights.</p>",
        'bot'
      )
    }, 500)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.animeBot = new AnimeBot()
})
