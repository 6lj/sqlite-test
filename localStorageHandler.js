// localStorageHandler.js

// Function to display LocalStorage data
function displayLocalStorage() {
  const storageList = document.getElementById('storageList');
  const messageDiv = document.getElementById('message');

  if (localStorage.length === 0) {
    storageList.innerHTML = '<p class="no-data">لا توجد بيانات مخزنة في LocalStorage</p>';
  } else {
    storageList.innerHTML = '';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      let value = localStorage.getItem(key);

      if (window.fileProcessor && window.fileProcessor.hasFileData(key)) {
        value = window.fileProcessor.loadFileData(key);
      }

      const itemDiv = document.createElement('div');
      itemDiv.className = 'storage-item';
      itemDiv.innerHTML = `<span class="key">${key}:</span> <span class="value">${value}</span>`;
      storageList.appendChild(itemDiv);
    }
  }
}

// Function to send data to server
async function sendDataToServer() {
  const messageDiv = document.getElementById('message');

  if (localStorage.length === 0) {
    showMessage('لا توجد بيانات لإرسالها', 'error');
    return;
  }

  const data = {
    timestamp: new Date().toISOString(),
    storageData: {}
  };

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    let value = localStorage.getItem(key);

    if (window.fileProcessor && window.fileProcessor.hasFileData(key)) {
      value = window.fileProcessor.loadFileData(key);
    }

    data.storageData[key] = value;
  }

  try {
    const response = await fetch('/api/save-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (response.ok) {
      showMessage(result.message || 'تم الحفظ بنجاح', 'success');
    } else {
      showMessage(result.message || 'فشل في الحفظ', 'error');
    }
  } catch (error) {
    showMessage('حدث خطأ أثناء الإرسال: ' + error.message, 'error');
  }
}

// Function to show messages
function showMessage(message, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.innerHTML = message;
  messageDiv.className = `message ${type}`;
}

// Expose functions globally
window.LocalStorageModule = {
  displayLocalStorage,
  sendDataToServer
};