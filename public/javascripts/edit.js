document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('editForm');
  const imageGrid = document.getElementById('sortableImages');
  let csrfToken = document.querySelector('input[name="_csrf"]').value;
  let hasChanges = false;
  let originalState = null;

  // Get original state
  if (imageGrid) {
    originalState = {
      title: form.querySelector('#title').value,
      images: JSON.parse(imageGrid.dataset.originalImages || '[]')
    };
  }
  
  // State change tracking
  const handleStateChange = () => {
    hasChanges = true;
  };

  // Function to update CSRF token
  const updateCsrfToken = (newToken) => {
    if (newToken && newToken !== csrfToken) {
      csrfToken = newToken;
      const tokenInputs = document.querySelectorAll('input[name="_csrf"]');
      tokenInputs.forEach(input => {
        input.value = newToken;
      });
      console.log('CSRF token updated');
    }
  };

  // Function to make authenticated requests
  const makeAuthenticatedRequest = async (url, options = {}) => {
    try {
      const defaultOptions = {
        credentials: 'same-origin',
        headers: {
          'X-CSRF-Token': csrfToken
        }
      };

      const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...(options.headers || {})
        }
      };

      console.log('Sending request with token:', csrfToken);
      const response = await fetch(url, mergedOptions);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('CSRF token 已过期，请刷新页面');
        }
        throw new Error('请求失败');
      }

      const data = await response.json();
      
      if (data.csrfToken) {
        updateCsrfToken(data.csrfToken);
      }

      return data;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  };

  // Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const data = await makeAuthenticatedRequest(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: form.querySelector('#title').value,
          _method: 'PUT',
          _csrf: csrfToken
        })
      });

      if (data.success) {
        window.location.href = '/admin';
      }
    } catch (error) {
      console.error('保存失败:', error);
      if (error.message.includes('CSRF')) {
        window.location.reload();
        return;
      }
      alert(error.message || '保存失败，请重试');
    }
  });

  // Initialize sortable
  if (imageGrid) {
    new Sortable(imageGrid, {
      animation: 150,
      onEnd: updateImageOrder
    });
  }

  // Cancel button handler
  const cancelBtn = document.querySelector('.cancel-btn[data-action="cancel"]');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      if (!hasChanges) {
        window.location.href = '/admin';
        return;
      }
      
      if (confirm('确定要取消编辑吗？所有更改将会丢失')) {
        try {
          await makeAuthenticatedRequest(`${window.location.pathname}/restore`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ originalState })
          });

          window.location.href = '/admin';
        } catch (error) {
          console.error('恢复失败:', error);
          alert('恢复原始状态失败，请重试');
        }
      }
    });
  }

  // Image upload handler
  const imageUpload = document.getElementById('imageUpload');
  imageUpload.addEventListener('change', async (e) => {
    const result = await handleImageUpload(e);
    if (result && result.success) {
      handleStateChange();
    }
  });

  // Image delete handlers
  document.querySelectorAll('.delete-image').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const result = await handleImageDelete(e, btn);
      if (result && result.success) {
        handleStateChange();
      }
    });
  });

  // Title change tracking
  form.querySelector('#title').addEventListener('input', handleStateChange);

  // Image upload handler
  async function handleImageUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let file of files) {
      formData.append('images', file);
    }
    
    try {
      await makeAuthenticatedRequest(`${window.location.pathname}/images`, {
        method: 'POST',
        body: formData
      });

      window.location.reload();
      return { success: true };
    } catch (err) {
      console.error('上传错误:', err);
      alert(err.message || '上传出错，请重试');
      return { success: false };
    }
  }

  // Image order update handler
  async function updateImageOrder() {
    const images = Array.from(document.querySelectorAll('.image-item img')).map(img => 
      img.src.split('/').pop()
    );

    try {
      const data = await makeAuthenticatedRequest(`${window.location.pathname}/images/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ images })
      });

      console.log('Order updated, new token:', data.csrfToken);
    } catch (err) {
      console.error('重排序错误:', err);
      if (err.message.includes('CSRF')) {
        window.location.reload();
        return;
      }
      alert('更新图片顺序失败，请重试');
    }
  }

  async function handleImageDelete(e, btn) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('确定要删除这张图片吗？')) {
      return { success: false };
    }

    try {
      const filename = btn.dataset.filename;
      await makeAuthenticatedRequest(`${window.location.pathname}/images/${filename}`, {
        method: 'DELETE'
      });

      btn.closest('.image-item').remove();
      return { success: true };
    } catch (err) {
      console.error('删除错误:', err);
      alert(err.message || '删除出错，请重试');
      return { success: false };
    }
  }
});