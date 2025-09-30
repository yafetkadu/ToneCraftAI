// Check login status when popup opens
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(["authToken", "user"], (data) => {
        if (data.authToken && data.user) {
            // User is logged in

            //updatePopupStatus(data.user.firstname, true);

            updateAuthState(data.user.firstname, true);

            updateTokens(data.user.tone_token);

        } else {
            // User is not logged in
            //updatePopupStatus("", false);
            updateAuthState("", false);
        }
    });
}); 



// Logout functionality
document.getElementById('logout-btn').addEventListener('click', () => {
    chrome.storage.local.remove(["authToken", "user"], () => {
        //updatePopupStatus("", false);
        console.log('Logged out successfully');
    });
});

// Login button
document.getElementById('login-btn').addEventListener('click', () => {
    chrome.windows.create({
        url: chrome.runtime.getURL('login.html'),
        type: 'popup',
        width: 400,
        height: 600,
        left: 200,
        top: 100
    });
});

// Register button
document.getElementById('register-btn').addEventListener('click', () => {
    chrome.windows.create({
        url: chrome.runtime.getURL('register.html'),
        type: 'popup',
        width: 400,
        height: 600,
        left: 200,
        top: 100
    });
});



function show(container) {
    container.style.display = "block";
}

function hide(container) {
    container.style.display = "none";
}



function updateAuthState(firstname = "Guest", isLoggedIn) {
    var authContainer = document.getElementById("auth-container");
    var appContainer = document.getElementById("app-container");
    const status = document.getElementById('status');
    if (isLoggedIn) {
        show(appContainer);
        hide(authContainer);
        status.textContent = `Logged in as ${firstname} 💕`;
    } else {
        show(authContainer);
        hide(appContainer);
          status.textContent = "Not logged in";

    }
}


updateAuthState("", false);


function updateTokens(tokens) {
    document.getElementById("token-status").textContent = tokens;
}


/*

DEOIWJDOIEJWDIOJEIOJWOIDJEWOIDJWEIO

*/


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
    const draft = emailInput.value.trim();
    const tone = toneSelect.value;

    let ai_check = document.getElementById("toneTokensToggle").checked;

    //alert(ai_check);


    
    if (!prompt) {
      showToast('Please enter some text to generate an email');
      return;
    }
    
    // Show loading indicator
    loadingIndicator.style.display = 'block';
    emailContent.textContent = '';


    if (ai_check) {
        generate_ai_email(draft, tone)
    } else {
        generate_simple_email(draft, tone)
    }
    
  });


  async function generate_simple_email(draft, tone) {
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sample email responses based on tone
      const sampleEmails = {
        formal: `Subject: Regarding ${draft}

Dear Recipient,

I am writing to you concerning the matter of ${draft}. After careful consideration, I believe it would be beneficial for us to arrange a meeting to discuss this further.

I would appreciate your insights on this topic and look forward to your response.

Sincerely,
[Your Name]`,
        casual: `Hey!

So I was thinking about ${draft} and wanted to get your thoughts on it. Maybe we can chat about it soon?

Let me know when you're free!

Cheers,
[Your Name]`,
        friendly: `Hi there!

Hope you're having a great day! I wanted to reach out about ${draft}. I think it could be really interesting to explore this together.

What do you think? Would love to hear your thoughts!

Best,
[Your Name]`,
        professional: `Subject: Discussion regarding ${draft}

Dear Colleague,

I am reaching out to discuss ${draft}. This presents an opportunity for us to collaborate and achieve our mutual objectives.

I would value your perspective on this matter. Please let me know a convenient time for us to connect.

Kind regards,
[Your Name]`,
        enthusiastic: `Subject: Exciting news about ${draft}!

Hello!

I'm absolutely thrilled about ${draft} and couldn't wait to share this with you! This is going to be amazing!

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
  }

async function generate_ai_email(draft, tone) {
    const BACKEND_URL_API = 'http://127.0.0.1:8000/generate';

    const prompt = {
        draft: draft,
        tone: tone,
    };

    const getFromStorage = () => {
        return new Promise((resolve) => {
            chrome.storage.local.get(["authToken", "user"], (data) => {
                resolve(data);
            });
        });
    };

    const { authToken } = await getFromStorage();

    try {
        // show loading here
        loadingIndicator.style.display = 'block';
        emailContent.textContent = '';

        const response = await fetch(BACKEND_URL_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify(prompt),
            // check if its raise HTTPException(status_code=402, detail="Not enough craft tokens")
            // then i get the details content
        });

        if (!response.ok) {
            const errorData = await response.json();
            showToast(errorData.detail) // 👈 show popup with error
            return;
        }

        const data = await response.json();
        console.log("Response:", data.drafted_email);
        emailContent.textContent = data.drafted_email;
        updateTokens(data.current_tokens);

    } catch (error) {
        emailContent.textContent = 'Sorry, there was an error generating your email. Please try again.';
        console.error(error);
    } finally {
        // always hide loading when done
        loadingIndicator.style.display = 'none';
    }
}



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

