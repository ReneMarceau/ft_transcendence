export function reloadPage() {
  const overlay = document.createElement('div');
  overlay.id = 'overlay';
  overlay.style.cssText =
    'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 9999;';

  document.body.appendChild(overlay);

  setTimeout(() => {
    const cleanUrl = window.location.origin + window.location.pathname;
    window.location.replace(cleanUrl);
  }, 500);
}

// type needs to be 'success', 'danger', 'warning', or anything else
export function createAlert(type, message) {
  const header = (type) => {
    if (type === 'success') {
      return 'Success!';
    } else if (type === 'danger') {
      return 'Error!';
    } else if (type === 'warning') {
      return 'Warning!';
    } else {
      return 'Info!';
    }
  };

  const existingAlert = document.querySelector('.alert');
  if (existingAlert) return;

  console.log(`Creating alert with type: ${type} and message: ${message}`);
  const alert = document.createElement('div');
  alert.style.cssText =
    'position: fixed; top: 70px; right: 20px; z-index: 10000;';
  alert.classList.add('alert', 'alert-dismissible', `alert-${type}`);
  alert.innerHTML = `
        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="alert-heading">${header(type)}</h4>
        <p class="mb-0">${message}</p>
    `;
  document.querySelector('body').appendChild(alert);

  setTimeout(() => {
    //thank you chatgpt
    alert.style.transition = 'opacity 1s ease';
    alert.style.opacity = '0';
    setTimeout(() => {
      alert.remove();
    }, 1000);
  }, 3000);
}

export function sanitizeInput(element) {
  const text = element.value;

  // Check for common XSS patterns
  const patterns = [
    /<script.*?>.*?<\/script>/gi, // Script tags
    /<iframe.*?>.*?<\/iframe>/gi, // iFrame tags
    /<object.*?>.*?<\/object>/gi, // Object tags
    /<embed.*?>.*?<\/embed>/gi, // Embed tags
    /<link.*?>.*?<\/link>/gi, // Link tags
    /<style.*?>.*?<\/style>/gi, // Style tags
    /on\w+=".*?"/gi, // Inline event handlers like onclick
    /javascript:/gi, // JavaScript URI scheme
    /vbscript:/gi, // VBScript URI scheme
    /data:text\/html/gi // Data URIs
  ];

  for (const pattern of patterns) {
    if (pattern.test(text)) {
      createAlert('danger', 'Potential XSS attempt detected!');
      element.value = ''; // Clear the input field
      return ''; // Return an empty string to prevent further processing
    }
  }

  // Escape HTML characters
  const escapedText = text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#96;');

  return escapedText;
}
