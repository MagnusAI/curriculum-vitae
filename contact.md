---
layout: default
title: Contact
---

<div class="container">
    <h1>Contact Me</h1>
    <p>If you'd like to get in touch, feel free to reach out through the following channels:</p>
    
    <div class="contact">
        <p>Email: <a href="mailto:arnild.commerce@gmail.com">arnild.commerce@gmail.com</a></p>
        <p>LinkedIn: <a href="https://www.linkedin.com/in/magnusarnild" target="_blank">linkedin.com/in/magnusarnild</a></p>
    </div>
    
    <h2>Contact Form</h2>
    <form id="contact-form" action="https://getform.io/f/broyxela" method="POST">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required>
        
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
        
        <label for="message">Message:</label>
        <textarea id="message" name="message" rows="5" required></textarea>
        
        <!-- Honeypot field for spam protection (hidden from users) -->
        <input type="text" name="_gotcha" style="display:none">
        
        <!-- Google reCAPTCHA v3 -->
        <input type="hidden" id="recaptcha-token" name="g-recaptcha-response">
        
        <button type="submit">Send Message</button>
    </form>
    
    <!-- Google reCAPTCHA Enterprise Script -->
    <script src="https://www.google.com/recaptcha/enterprise.js?render='6LfaXfEqAAAAACH4mBlVre9QQtfR2GpWCXqdcS0s'"></script>
    <script>
        grecaptcha.ready(function() {
            grecaptcha.execute('6LfaXfEqAAAAACH4mBlVre9QQtfR2GpWCXqdcS0s', {action: 'submit'}).then(function(token) {
                document.getElementById('recaptcha-token').value = token;
            });
        });
    </script>
</div>
