// DOM elements
const modeToggle = document.getElementById('modeToggle');
const historyBtn = document.getElementById('historyBtn');
const emailInput = document.getElementById('emailInput');
const toneSelect = document.getElementById('toneSelect');
const generateBtn = document.getElementById('generateBtn');
const emailContent = document.getElementById('emailContent');
const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const toast = document.getElementById('toast');

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
}

// Toggle dark mode
modeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  
  // Save preference
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.setItem('darkMode', 'disabled');
  }
});

// Generate email function
generateBtn.addEventListener('click', async () => {
  const prompt = emailInput.value.trim();
  const tone = toneSelect.value;
  
  if (!prompt) {
    showToast('Please enter some text to generate an email');
    return;
  }
  
  // Show loading indicator
  loadingIndicator.style.display = 'block';
  emailContent.textContent = '';
  
  try {
    // Simulate API call with timeout
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Sample email responses based on tone
    const sampleEmails = {
      formal: `Subject: Regarding ${prompt}

Dear Recipient,

I am writing to you concerning the matter of ${prompt}. After careful consideration, I believe it would be beneficial for us to arrange a meeting to discuss this further.

I would appreciate your insights on this topic and look forward to your response.

Sincerely,
[Your Name]`,
      casual: `Hey!

So I was thinking about ${prompt} and wanted to get your thoughts on it. Maybe we can chat about it soon?

Let me know when you're free!

Cheers,
[Your Name]`,
      friendly: `Hi there!

Hope you're having a great day! I wanted to reach out about ${prompt}. I think it could be really interesting to explore this together.

What do you think? Would love to hear your thoughts!

Best,
[Your Name]`,
      professional: `Subject: Discussion regarding ${prompt}

Dear Colleague,

I am reaching out to discuss ${prompt}. This presents an opportunity for us to collaborate and achieve our mutual objectives.

I would value your perspective on this matter. Please let me know a convenient time for us to connect.

Kind regards,
[Your Name]`,
      enthusiastic: `Subject: Exciting news about ${prompt}!

Hello!

I'm absolutely thrilled about ${prompt} and couldn't wait to share this with you! This is going to be amazing!

Let's connect soon to talk about all the possibilities!

Warmly,
[Your Name]`
    };
    
    emailContent.textContent = sampleEmails[tone] || sampleEmails.formal;
  } catch (error) {
    emailContent.textContent = 'Sorry, there was an error generating your email. Please try again.';
  } finally {
    loadingIndicator.style.display = 'none';
  }
});

// Copy email content
copyBtn.addEventListener('click', () => {
  const textToCopy = emailContent.textContent;
  navigator.clipboard.writeText(textToCopy).then(() => {
    showToast('Email copied to clipboard!');
  }).catch(err => {
    showToast('Failed to copy text');
  });
});

// Save email to history
saveBtn.addEventListener('click', () => {
  const emailText = emailContent.textContent;
  if (emailText && emailText !== 'Your generated email will appear here...') {
    // In a real extension, this would save to storage
    showToast('Email saved to history!');
  } else {
    showToast('No email to save');
  }
});

// History button
historyBtn.addEventListener('click', () => {
  showToast('History feature coming soon!');
});

// Toast notification function
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Add some interactive effects to bubbles
document.addEventListener('mousemove', (e) => {
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;
  
  const bubbles = document.querySelectorAll('.bubble');
  bubbles.forEach((bubble, index) => {
    const moveX = (x - 0.5) * 20 * (index % 2 ? 1 : -1);
    const moveY = (y - 0.5) * 20 * (index < 2 ? 1 : -1);
    
    bubble.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
});
