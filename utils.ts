export function formatTimestamp(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function sanitizeHTML(text: string): string {
  const element = document.createElement('div');
  element.textContent = text;
  return element.innerHTML;
}

export function createMessageElement(message: string, isUser: boolean): HTMLDivElement {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'message-user' : 'message-bot'}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.innerHTML = isUser ? '<i class="bi bi-person"></i>' : '<i class="bi bi-robot"></i>';
  
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  
  // Process message content with markdown-like formatting
  let processedMessage = message;
  
  if (!isUser) {
    // Convert URLs to links
    processedMessage = processedMessage.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Convert **text** to bold
    processedMessage = processedMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *text* to italic
    processedMessage = processedMessage.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert ```code blocks```
    processedMessage = processedMessage.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Convert `inline code`
    processedMessage = processedMessage.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert bullet lists
    processedMessage = processedMessage.replace(/^- (.*$)/gm, '<li>$1</li>');
    processedMessage = processedMessage.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Convert line breaks
    processedMessage = processedMessage.replace(/\n/g, '<br>');
    
    messageContent.innerHTML = processedMessage;
  } else {
    // For user messages, just use the sanitized content with line breaks
    messageContent.innerHTML = message.replace(/\n/g, '<br>');
  }
  
  // Append elements
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(messageContent);
  
  return messageDiv;
}

// Add sidebar toggle functionality for mobile
export function setupSidebarToggle(): void {
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const closeSidebar = document.getElementById('close-sidebar');
  const sidebar = document.getElementById('sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.add('show');
    });
  }
  
  if (closeSidebar && sidebar) {
    closeSidebar.addEventListener('click', () => {
      sidebar.classList.remove('show');
    });
  }
  
  // Close sidebar when clicking outside of it on mobile
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (
      window.innerWidth <= 992 &&
      sidebar?.classList.contains('show') &&
      !sidebar.contains(target) &&
      target.id !== 'sidebar-toggle' &&
      !target.closest('#sidebar-toggle')
    ) {
      sidebar.classList.remove('show');
    }
  });
}

// Initialize the sidebar toggle when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupSidebarToggle();
});