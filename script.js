let _config = {
  openAI_api: 'https://alcuino-chatbot.azurewebsites.net/api/OpenAIProxy',
  openAI_model: 'gpt-4o-mini',
  ai_instruction: `You are a professional anime expert and educator specializing EXCLUSIVELY in anime, manga, and Japanese animation culture.

CRITICAL ACCURACY RULES:
1. Do NOT fabricate or invent anime titles that don't exist. Only recommend real anime series.
2. When discussing anime seasons or release dates, mention that information may not be current and suggest checking MyAnimeList or Crunchyroll for the latest updates.
3. Focus on providing helpful information about anime you know about, and be honest when information may be outdated.

STRICT TOPIC BOUNDARIES:
- ONLY answer questions related to: anime, manga, Japanese animation, anime characters, anime studios, voice actors (seiyuu), anime directors, anime genres, Japanese pop culture related to anime, anime conventions, cosplay, anime merchandise, anime streaming platforms, light novels, visual novels, anime music (openings/endings/OSTs), Japanese cultural elements in anime, otaku culture, and anime industry news
- If a question is NOT about anime or related Japanese animation culture, you MUST politely decline and redirect
- EXCEPTION: Friendly greetings (hello, hi, hey, etc.) should be warmly welcomed with anime-related conversation starters

HANDLING GREETINGS & CASUAL CONVERSATION:
- When users greet you (hi, hello, hey, what's up, etc.), respond warmly and immediately engage them with anime-related questions or suggestions
- Example greeting responses:
  * "Hey there! Are you looking for anime recommendations, or would you like to discuss a specific series?"
  * "Hello! What brings you here today? Looking for new manga to read, or curious about seasonal anime?"
  * "Hi! Ready to dive into the world of anime? I can help with recommendations, rankings, or answer any anime-related questions!"
- Never treat friendly greetings as off-topic

RESPONSE GUIDELINES FOR ANIME TOPICS:
- Provide detailed, informative responses about anime titles, characters, studios, directors, and industry trends
- Offer personalized recommendations based on user preferences (including hidden gems, underrated titles, and cult classics)
- Suggest new manga releases, ongoing series, underground/indie manga, and web manga
- Discuss current anime/manga rankings from MyAnimeList, AniList, Crunchyroll, and Anime News Network
- Provide insights on seasonal anime trends, simulcasts, and upcoming releases
- Explain anime terminology (isekai, shonen, seinen, josei, shoujo, mecha, slice of life, etc.)
- Discuss Japanese cultural elements: festivals (matsuri), traditions (tea ceremony, onsen), food culture (ramen, bento), mythology (yokai, kami), shrines and temples, Japanese school system, and historical periods (Edo, Meiji, etc.)
- Share information about anime awards (Crunchyroll Awards, Tokyo Anime Awards, Japan Media Arts Festival)
- Analyze art styles, sakuga (exceptional animation), animation techniques, and character design
- Discuss voice actor (seiyuu) performances, iconic roles, and industry insights
- Cover manga artists (mangaka) and their unique styles
- Explain the manga-to-anime adaptation process, differences between source material and anime
- Discuss anime music: opening/ending themes, OSTs, anime composers (Yuki Kajiura, Hiroyuki Sawano, etc.), and anime songs (anisong)
- Share information about: light novels, visual novels, anime conventions, cosplay, figures/merchandise, anime cafes
- Provide streaming platform availability (Crunchyroll, Netflix, Funimation, HIDIVE, etc.)
- Discuss anime genres and subgenres in depth
- Compare different anime eras (90s anime vs modern, golden age, etc.)
- Always respond in clear, structured HTML format
- Use proper HTML tags: <p>, <strong>, <em>, <ul>, <li>, <br> for formatting
- Never use markdown syntax (no ** or __)
- Keep responses informative, engaging, yet concise
- Maintain an enthusiastic, knowledgeable, and friendly tone
- Do NOT use emojis in responses

RESPONSE FOR NON-ANIME TOPICS:
When asked about anything genuinely unrelated to anime/manga/Japanese animation (NOT greetings), respond with:
<p>I apologize, but I specialize exclusively in anime, manga, and Japanese animation topics. I'm not able to answer questions about [topic mentioned].</p>
<p><strong>I can help you with:</strong></p>
<ul>
<li>Anime and manga recommendations (popular, hidden gems, underrated classics)</li>
<li>New manga releases, ongoing series, and web manga</li>
<li>Current anime/manga rankings and trending titles</li>
<li>Seasonal anime watch guides and simulcasts</li>
<li>Character analysis, plot discussions, and theories</li>
<li>Studio insights, animation techniques, and art styles</li>
<li>Japanese cultural elements in anime (festivals, traditions, mythology, history)</li>
<li>Voice actors (seiyuu), anime music, and soundtracks</li>
<li>Light novels, visual novels, and manga-to-anime adaptations</li>
<li>Anime conventions, cosplay tips, and merchandise</li>
<li>Streaming platforms and where to watch legally</li>
<li>Anime industry news and upcoming releases</li>
</ul>
<p>What anime topic would you like to explore?</p>

EXAMPLE GREETING RESPONSE:
<p>Hey there! Welcome to your anime expert assistant!</p>
<p><strong>What would you like to explore today?</strong></p>
<ul>
<li>Discover new anime recommendations</li>
<li>Find hidden gem manga series</li>
<li>Check out this season's top anime</li>
<li>Learn about Japanese culture in anime</li>
<li>Discuss your favorite series</li>
</ul>
<p>Just let me know what you're interested in!</p>

EXAMPLE ANIME RESPONSE FORMAT:
<p><strong>Attack on Titan (Shingeki no Kyojin)</strong> is a critically acclaimed dark fantasy anime series.</p>
<p><strong>Key Information:</strong></p>
<ul>
<li><strong>Studio:</strong> MAPPA (Final Season), Wit Studio (Seasons 1-3)</li>
<li><strong>Genre:</strong> Dark Fantasy, Action, Drama, Mystery</li>
<li><strong>Episodes:</strong> 87 (Complete)</li>
<li><strong>MyAnimeList Score:</strong> 9.0+ (Top 10)</li>
<li><strong>Director:</strong> Hajime Isayama (manga), Yuichiro Hayashi (Final Season)</li>
</ul>
<p><strong>Notable Aspects:</strong> Exceptional world-building, complex characters, incredible soundtrack by Hiroyuki Sawano, and stunning animation particularly in action sequences (sakuga).</p>`,
  response_id: '',
}

class AnimeBot {
  constructor() {
    this.chatMessages = document.getElementById('chatMessages')
    this.userInput = document.getElementById('userInput')
    this.sendButton = document.getElementById('sendButton')
    this.isProcessing = false
    this.STORAGE_KEYS = {
      MESSAGES: 'anime_chat_history',
      THEME: 'anime_chat_theme',
    }

    this.initialize()
  }

  initialize() {
    this.setupEventListeners()
    this.loadTheme()
    this.loadChatHistory()
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

    // Character counter with 100ms debounce for performance
    let debounceTimer
    this.userInput.addEventListener('input', () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        const charCounter = document.getElementById('charCounter')
        const length = this.userInput.value.length
        charCounter.textContent = `${length} / 500`

        charCounter.classList.remove('warning', 'danger')
        if (length > 475) {
          charCounter.classList.add('danger')
        } else if (length > 400) {
          charCounter.classList.add('warning')
        }
      }, 100)
    })

    const themeToggle = document.getElementById('themeToggle')
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme())
    }

    const clearChatBtn = document.getElementById('clearChatButton')
    if (clearChatBtn) {
      clearChatBtn.addEventListener('click', () => this.clearChat())
    }

    const quickActionBtns = document.querySelectorAll('.quick-action-btn')
    quickActionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query')
        if (query) {
          this.userInput.value = query
          this.sendMessage()
        }
      })
    })
  }

  async sendMessage() {
    const message = this.userInput.value.trim()

    if (!message) {
      this.userInput.classList.add('shake')
      setTimeout(() => this.userInput.classList.remove('shake'), 500)
      return
    }

    if (this.isProcessing) return

    this.isProcessing = true

    this.addMessage(message, 'user')
    this.userInput.value = ''
    this.userInput.disabled = true
    this.sendButton.disabled = true
    this.sendButton.classList.add('loading')
    this.showTyping()

    try {
      const response = await this.sendOpenAIRequest(message)
      this.hideTyping()
      this.addMessage(response, 'bot')
    } catch (error) {
      this.hideTyping()
      this.addMessage(
        '<p><strong>Connection Error</strong></p>' +
          '<p>I apologize, but I encountered an error processing your request.</p>' +
          '<p><strong>Please try:</strong></p>' +
          '<ul>' +
          '<li>Checking your internet connection</li>' +
          '<li>Refreshing the page</li>' +
          '<li>Asking your question again in a moment</li>' +
          '</ul>' +
          '<p>If the problem persists, please contact support.</p>',
        'bot'
      )
      console.error('Error processing message:', error)
    } finally {
      this.isProcessing = false
      this.userInput.disabled = false
      this.sendButton.disabled = false
      this.sendButton.classList.remove('loading')
      this.userInput.focus()
      document.getElementById('charCounter').textContent = '0 / 500'
    }
  }

  addMessage(content, sender, skipSave = false) {
    const messageDiv = document.createElement('div')
    messageDiv.className = `message ${sender}-message`

    // Create wrapper for content and time
    const messageWrapper = document.createElement('div')
    messageWrapper.className = 'message-wrapper'

    const contentDiv = document.createElement('div')
    contentDiv.className = 'message-content'
    contentDiv.innerHTML = content

    if (sender === 'bot') {
      const copyBtn = document.createElement('button')
      copyBtn.className = 'copy-btn'
      copyBtn.title = 'Copy message'
      copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
      </svg>`
      copyBtn.addEventListener('click', () =>
        this.copyMessage(copyBtn, content)
      )
      contentDiv.appendChild(copyBtn)
    }

    const timeDiv = document.createElement('div')
    timeDiv.className = 'message-time'
    timeDiv.textContent = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    messageWrapper.appendChild(contentDiv)
    messageWrapper.appendChild(timeDiv)

    if (sender === 'bot') {
      const avatarDiv = document.createElement('div')
      avatarDiv.className = 'message-avatar'
      avatarDiv.innerHTML =
        "<img src=\"images/anime.png\" alt=\"Bot\" onerror=\"this.style.display='none'; this.parentElement.innerHTML='<svg viewBox=\\'0 0 24 24\\' fill=\\'none\\' xmlns=\\'http://www.w3.org/2000/svg\\'><circle cx=\\'12\\' cy=\\'12\\' r=\\'10\\' fill=\\'url(#grad)\\'/><defs><linearGradient id=\\'grad\\'><stop offset=\\'0%\\' stop-color=\\'#667eea\\'/><stop offset=\\'100%\\' stop-color=\\'#764ba2\\'/></linearGradient></defs></svg>'\">"
      messageDiv.appendChild(avatarDiv)
      messageDiv.appendChild(messageWrapper)
    }

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

    if (!skipSave) {
      this.saveChatHistory(content, sender)
    }

    this.scrollToBottom()
  }

  showTyping() {
    const typingDiv = document.createElement('div')
    typingDiv.className = 'message bot-message typing-indicator'
    typingDiv.id = 'typing-indicator'

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
    this.chatMessages.scrollTo({
      top: this.chatMessages.scrollHeight,
      behavior: 'smooth',
    })
  }

  showWelcomeMessage() {
    const history = localStorage.getItem(this.STORAGE_KEYS.MESSAGES)
    if (!history || JSON.parse(history).length === 0) {
      setTimeout(() => {
        this.addMessage(
          '<p><strong>Welcome to Anime Intelligence Assistant</strong></p>' +
            "<p>I'm your professional anime expert powered by OpenAI. I can help you with:</p>" +
            '<ul>' +
            '<li>Detailed anime and manga information</li>' +
            '<li>Personalized recommendations (including hidden gems and underrated titles)</li>' +
            '<li>New manga releases and underground indie manga</li>' +
            '<li>Current rankings and trending anime/manga</li>' +
            '<li>Character analysis and plot discussions</li>' +
            '<li>Japanese cultural elements in anime (festivals, traditions, mythology)</li>' +
            '<li>Studio history, production insights, and animation techniques</li>' +
            '<li>Voice actors, anime music, and soundtracks</li>' +
            '<li>Seasonal anime and upcoming releases</li>' +
            '<li>Light novels, visual novels, and adaptations</li>' +
            '<li>Streaming availability and release schedules</li>' +
            '</ul>' +
            "<p>Ask me anything about anime and I'll provide comprehensive, professional insights!</p>",
          'bot',
          true
        )
      }, 500)
    }
  }

  saveChatHistory(content, sender) {
    try {
      let history = JSON.parse(
        localStorage.getItem(this.STORAGE_KEYS.MESSAGES) || '[]'
      )
      history.push({ content, sender, timestamp: new Date().toISOString() })
      if (history.length > 50) {
        history = history.slice(-50)
      }
      localStorage.setItem(this.STORAGE_KEYS.MESSAGES, JSON.stringify(history))
    } catch (error) {
      console.error('Error saving chat history:', error)
    }
  }

  loadChatHistory() {
    try {
      const history = JSON.parse(
        localStorage.getItem(this.STORAGE_KEYS.MESSAGES) || '[]'
      )

      const recentHistory = history.slice(-20)

      recentHistory.forEach((msg) => {
        this.addMessage(msg.content, msg.sender, true)
      })

      if (history.length === 0) {
        this.showWelcomeMessage()
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      this.showWelcomeMessage()
    }
  }

  clearChat() {
    if (
      confirm(
        'Are you sure you want to clear all chat history? This cannot be undone.'
      )
    ) {
      localStorage.removeItem(this.STORAGE_KEYS.MESSAGES)
      this.chatMessages.innerHTML = ''
      _config.response_id = ''
      this.showWelcomeMessage()
    }
  }

  toggleTheme() {
    const body = document.body
    const sunIcon = document.getElementById('sunIcon')
    const moonIcon = document.getElementById('moonIcon')

    body.classList.toggle('light-mode')

    if (body.classList.contains('light-mode')) {
      sunIcon.style.display = 'none'
      moonIcon.style.display = 'block'
      localStorage.setItem(this.STORAGE_KEYS.THEME, 'light')
    } else {
      sunIcon.style.display = 'block'
      moonIcon.style.display = 'none'
      localStorage.setItem(this.STORAGE_KEYS.THEME, 'dark')
    }
  }

  loadTheme() {
    const savedTheme = localStorage.getItem(this.STORAGE_KEYS.THEME)
    const sunIcon = document.getElementById('sunIcon')
    const moonIcon = document.getElementById('moonIcon')

    if (savedTheme === 'light') {
      document.body.classList.add('light-mode')
      sunIcon.style.display = 'none'
      moonIcon.style.display = 'block'
    }
  }

  async sendOpenAIRequest(userMessage) {
    try {
      const requestBody = {
        model: _config.openAI_model,
        input: userMessage,
        instructions: _config.ai_instruction,
      }

      if (_config.response_id) {
        requestBody.previous_response_id = _config.response_id
      }

      const response = await fetch(_config.openAI_api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const output =
        data.output?.[0]?.content?.[0]?.text ||
        'Sorry, I could not process your request.'

      if (data.id) {
        _config.response_id = data.id
      }

      return output
    } catch (error) {
      console.error('Error calling OpenAI API:', error)
      throw error
    }
  }

  copyMessage(button, content) {
    const temp = document.createElement('div')
    temp.innerHTML = content
    const text = temp.textContent || temp.innerText

    navigator.clipboard
      .writeText(text)
      .then(() => {
        button.classList.add('copied')
        button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`

        setTimeout(() => {
          button.classList.remove('copied')
          button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
        </svg>`
        }, 2000)
      })
      .catch((err) => {
        console.error('Failed to copy:', err)
        alert('Failed to copy message. Please try again.')
      })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.animeBot = new AnimeBot()

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log(
          'Service Worker registered successfully:',
          registration.scope
        )
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error)
      })
  }
})
