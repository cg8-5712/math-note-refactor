document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('editForm');
  const imageGrid = document.getElementById('sortableImages');
  const csrfInput = document.querySelector('input[name="_csrf"]');
  let csrfToken = csrfInput ? csrfInput.value : null;
  let hasChanges = false;
  let originalState = null;

  // Get original state
  if (form && imageGrid) {
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
      if (csrfInput) {
        csrfInput.value = newToken;
      }
      console.log('CSRF token 已更新:', newToken);
    }
  };

  // Function to make authenticated requests
  const makeAuthenticatedRequest = async (url, options = {}) => {
    try {
      const requestUrl = url.startsWith('http') 
        ? url 
        : `${window.location.protocol}//${window.location.host}${url}`;

      const defaultOptions = {
        credentials: 'same-origin',
        headers: {
          'X-CSRF-Token': csrfToken,
          'Accept': 'application/json'
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

      const response = await fetch(requestUrl, mergedOptions);
      const contentType = response.headers.get('content-type');
      let data = null;

      if (contentType?.includes('application/json')) {
        data = await response.json();
        if (data?.csrfToken) {
          updateCsrfToken(data.csrfToken);
        }
      }

      if (!response.ok) {
        throw new Error(data?.message || '请求失败');
      }

      return data;
    } catch (error) {
      console.error('Request failed:', error);
      if (error.message.includes('会话已过期')) {
        window.location.reload();
        return null;
      }
      throw error;
    }
  };

  // Form submission handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const formData = {
          title: form.querySelector('#title').value,
          _method: 'PUT'
        };

        const data = await makeAuthenticatedRequest(form.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (data?.success) {
          window.location.href = '/admin';
        }
      } catch (error) {
        console.error('保存失败:', error);
        alert(error.message || '保存失败，请重试');
      }
    });
  }

  // Network status handlers
  window.addEventListener('online', () => {
    console.log('Network connection restored');
  });

  window.addEventListener('offline', () => {
    console.log('Network connection lost');
    alert('网络连接已断开，部分功能可能无法使用');
  });

  // Unload warning
  window.addEventListener('beforeunload', (e) => {
    if (hasChanges) {
      e.preventDefault();
      e.returnValue = '您有未保存的更改，确定要离开吗？';
    }
  });

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

      if (data?.success) {
        console.log('排序更新成功');
        handleStateChange();
      }
    } catch (err) {
      console.error('重排序错误:', err);
      alert('更新图片顺序失败，请重试');
    }
  }

  // Initialize sortable
  if (imageGrid) {
    new Sortable(imageGrid, {
      animation: 150,
      onEnd: () => {
        updateImageOrder().catch(error => {
          console.error('Sortable error:', error);
        });
      }
    });
  }

  // Image upload handler
  const imageUpload = document.getElementById('imageUpload');
  if (imageUpload) {
    imageUpload.addEventListener('change', async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const formData = new FormData();
      for (let file of files) {
        formData.append('images', file);
      }
      
      try {
        const data = await makeAuthenticatedRequest(`${window.location.pathname}/images`, {
          method: 'POST',
          body: formData
        });

        if (data?.success) {
          window.location.reload();
        }
      } catch (err) {
        console.error('上传错误:', err);
        alert(err.message || '上传出错，请重试');
      }
    });
  }

  // Image delete handlers
  document.querySelectorAll('.delete-image').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!confirm('确定要删除这张图片吗？')) {
        return;
      }

      try {
        const filename = btn.dataset.filename;
        const data = await makeAuthenticatedRequest(`${window.location.pathname}/images/${filename}`, {
          method: 'DELETE'
        });

        if (data?.success) {
          btn.closest('.image-item').remove();
          handleStateChange();
        }
      } catch (err) {
        console.error('删除错误:', err);
        alert(err.message || '删除出错，请重试');
      }
    });
  });

  // Cancel button handler
  const cancelBtn = document.querySelector('.cancel-btn[data-action="cancel"]');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      if (!hasChanges || !originalState) {
        window.location.href = '/admin';
        return;
      }
      
      if (confirm('确定要取消编辑吗？所有更改将会丢失')) {
        try {
          const data = await makeAuthenticatedRequest(`${window.location.pathname}/restore`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ originalState })
          });

          if (data?.success) {
            window.location.href = '/admin';
          }
        } catch (error) {
          console.error('恢复失败:', error);
          alert('恢复原始状态失败，请重试');
        }
      }
    });
  }
});