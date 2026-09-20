// querySelector caches the elements we use repeatedly instead of searching the DOM for every action.
const form = document.querySelector('#chat-form');
const input = document.querySelector('#message-input');
const messages = document.querySelector('#messages');
const sendButton = document.querySelector('.send-button');
const promptButtons = document.querySelectorAll('.prompt-button');
const themeToggle = document.querySelector('#theme-toggle');

const THEME_STORAGE_KEY = 'glitter-theme';
const BOT_AVATAR = '<div class="avatar" aria-hidden="true"><img src="assets/glitter-emoji.png" alt=""></div>';
const DEFAULT_REPLY = 'That is interesting! Tell me a little more, or ask me what I can do.';

// CSS reads this data attribute to switch its light and dark variable sets.
function setTheme(theme) {
	const darkMode = theme === 'dark';
	document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
	themeToggle.setAttribute('aria-pressed', String(darkMode));
	themeToggle.setAttribute('aria-label', darkMode ? 'Switch to light mode' : 'Switch to dark mode');
	themeToggle.setAttribute('title', darkMode ? 'Switch to light mode' : 'Switch to dark mode');
}

// Restore the visitor's last choice. Light mode is the fallback for a first visit.
setTheme(localStorage.getItem(THEME_STORAGE_KEY) || 'light');

// Each entry maps a few recognizable words to a simple local reply.
const replies = [
	{ matches: ['hello', 'hi', 'hey'], text: 'Hello! It is lovely to hear from you. What is on your mind?' },
	{ matches: ['what can you do', 'help'], text: 'I can chat with you, answer simple questions, tell jokes, and keep you company.' },
	{ matches: ['joke', 'funny'], text: 'Why did the developer go broke? Because they used up all their cache.' },
	{ matches: ['how are you', 'how are'], text: 'I am running smoothly and ready to help. Thanks for asking!' },
	{ matches: ['weather'], text: 'I cannot check live weather yet, but your favorite weather app should have the latest forecast.' },
	{ matches: ['thank'], text: 'You are very welcome!' }
];

function getReply(message) {
	const normalized = message.toLowerCase();
	const match = replies.find((reply) => reply.matches.some((keyword) => normalized.includes(keyword)));
	return match ? match.text : DEFAULT_REPLY;
}

function scrollToLatestMessage() {
	messages.scrollTop = messages.scrollHeight;
}

function addMessage(text, type) {
	const article = document.createElement('article');
	article.className = `message ${type}-message`;
	const avatar = type === 'bot' ? BOT_AVATAR : '';
	article.innerHTML = `${avatar}<div class="bubble"><p></p><time>Just now</time></div>`;
	article.querySelector('p').textContent = text;
	messages.appendChild(article);
	scrollToLatestMessage();
}

function showTyping() {
	const typing = document.createElement('article');
	typing.className = 'message bot-message';
	typing.id = 'typing-indicator';
	typing.innerHTML = `${BOT_AVATAR}<div class="bubble typing" aria-label="Glitter is typing"><i></i><i></i><i></i></div>`;
	messages.appendChild(typing);
	scrollToLatestMessage();
}

function sendMessage(text) {
	const cleanText = text.trim();
	// This guard prevents empty messages and rapid duplicate sends while Glitter replies.
	if (!cleanText || sendButton.disabled) return;
	addMessage(cleanText, 'user');
	input.value = '';
	sendButton.disabled = true;
	showTyping();

	// The delay makes the local reply feel conversational and gives the typing indicator time to show.
	window.setTimeout(() => {
		document.querySelector('#typing-indicator')?.remove();
		addMessage(getReply(cleanText), 'bot');
		sendButton.disabled = false;
		input.focus();
	}, 650);
}

// Form submission handles both the send button and the Enter key.
form.addEventListener('submit', (event) => {
	event.preventDefault();
	sendMessage(input.value);
});

// Quick prompts reuse the same send path as typed messages.
promptButtons.forEach((button) => {
	button.addEventListener('click', () => sendMessage(button.textContent));
});

// Theme switching is a click event, not a typing interaction, so debouncing is unnecessary.
themeToggle.addEventListener('click', () => {
	const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
	setTheme(nextTheme);
	localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
});
