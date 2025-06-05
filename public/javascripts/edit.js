// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const form = document.getElementById('editForm');
  const imageGrid = document.getElementById('sortableImages');
  const imageUpload = document.getElementById('imageUpload');
  const csrfInput = document.querySelector('input[name="_csrf"]');
  const saveStatus = document.querySelector('.save-status');
  
  // State management
  let csrfToken = csrfInput ? csrfInput.value : null;
  let hasChanges = false;
  let currentState = {
    title: '',
    images: [],
    pendingUploads: [],
    pendingDeletes: [],
    imageOrder: []
  };

  // Initialize state
  const initializeState = () => {
    if (form && imageGrid) {
      currentState.title = form.querySelector('#title').value;
      currentState.images = JSON.parse(imageGrid.dataset.originalImages || '[]');
      currentState.imageOrder = [...currentState.images];
    }
  };

  // State update handlers
  const handleStateChange = () => {
    hasChanges = true;
    updateSaveButtonState();
  };

  const updateSaveButtonState = () => {
    const saveBtn = form?.querySelector('button[type="submit"]');
    if (saveBtn) {
      saveBtn.disabled = !hasChanges;
    }
  };

  // CSRF token management
  const updateCsrfToken = (newToken) => {
    if (newToken && newToken !== csrfToken) {
      csrfToken = newToken;
      if (csrfInput) {
        csrfInput.value = newToken;
      }
    }
  };

  // API request handler
  const makeAuthenticatedRequest = async (url, options = {}) => {
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

  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };

  const response = await fetch(requestUrl, mergedOptions);

  // 检查是否重定向到登录页面
  if (response.redirected && response.url.includes('/admin/login')) {
    throw new Error('NOT_AUTHENTICATED');
  }

  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType?.includes('application/json')) {
    data = await response.json();
    if (data?.csrfToken) {
      updateCsrfToken(data.csrfToken);
    }
  }

  if (!response.ok) {
    // 处理 CSRF 失效
    if (data?.code === 'INVALID_TOKEN' || data?.code === 'TOKEN_EXPIRED') {
      throw new Error('CSRF_EXPIRED');
    }
    // 处理未登录
    if (response.status === 401 || response.status === 403 || data?.code === 'UNAUTHORIZED') {
      throw new Error('NOT_AUTHENTICATED');
    }
    throw new Error(data?.error || '请求失败');
  }

  return data;
  };

  // Image preview handler
  const createImagePreview = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
          <img src="${e.target.result}" alt="预览图片" data-filename="${file.name}">
          <button class="delete-image" type="button" data-filename="${file.name}">×</button>
        `;
        resolve(imageItem);
      };
      reader.readAsDataURL(file);
    });
  };

  // 事件委托：给 imageGrid 绑定一次性监听器，处理所有 .delete-image 按钮点击
  if (imageGrid) {
    imageGrid.addEventListener('click', function(e) {
      const btn = e.target.closest('.delete-image');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        handleImageDelete(btn);
      }
    });
  }

  // 修改 handleImageDelete 支持事件委托
  const handleImageDelete = (btn) => {
    if (!btn) return;
    if (!confirm('确定要删除这张图片吗？')) return;

    const filename = btn.dataset.filename;
    const imageItem = btn.closest('.image-item');

    if (imageItem) {
      const uploadIndex = currentState.pendingUploads.findIndex(
        item => item.file.name === filename
      );
      if (uploadIndex > -1) {
        currentState.pendingUploads.splice(uploadIndex, 1);
      } else {
        currentState.pendingDeletes.push(filename);
      }
      imageItem.remove();
      handleStateChange();
      updateImageOrder();
    }
  };

  // Image order handler
  const updateImageOrder = debounce(() => {
    const images = Array.from(
      document.querySelectorAll('.image-item img')
    ).map(img => img.dataset.filename);
    
    currentState.imageOrder = images;
    handleStateChange();
  }, 500);

  // Initialize Sortable
  if (imageGrid) {
    new Sortable(imageGrid, {
      animation: 150,
      onSort: updateImageOrder,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag'
    });
  }

  // Image upload handler
  if (imageGrid && imageUpload) {
    imageUpload.addEventListener('change', async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      try {
        for (let file of files) {
          const imageItem = await createImagePreview(file);
          imageGrid.appendChild(imageItem);
          currentState.pendingUploads.push({
            file,
            element: imageItem
          });
        }

        handleStateChange();
        imageUpload.value = '';
      } catch (error) {
        console.error('图片上传预览失败:', error);
        alert('图片处理失败，请重试');
      }
    });
  }

  // Page unload handler
  let unloadHandler = function(e) {
    if (hasChanges) {
      e.preventDefault();
      e.returnValue = '您有未保存的更改，确定要离开吗？';
    }
  };
  window.addEventListener('beforeunload', unloadHandler);

  // Form submission handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      window.removeEventListener('beforeunload', unloadHandler);

      const titleInput = form.querySelector('#title');
      const title = titleInput?.value?.trim();

      if (!title) {
        alert('标题不能为空');
        titleInput?.focus();
        window.addEventListener('beforeunload', unloadHandler);
        return;
      }

      let triedRefresh = false;

      // 处理图片删除
      const handleImageDeletions = async () => {
        if (currentState.pendingDeletes.length === 0) return;

        for (const filename of currentState.pendingDeletes) {
          try {
            await makeAuthenticatedRequest(
                `${window.location.pathname}/images/${filename}`,
                { method: 'DELETE' }
            );
          } catch (error) {
            console.error(`Failed to delete image ${filename}:`, error);
          }
        }
      };

      // 准备表单数据
      const prepareFormData = (title) => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('_csrf', csrfToken);
        formData.append('_method', 'PUT');

        // 添加待上传的图片
        currentState.pendingUploads.forEach(({file}) => {
          formData.append('images', file);
        });

        // 添加图片顺序
        const currentImages = Array.from(
            document.querySelectorAll('.image-item img')
        ).map(img => img.dataset.filename)
            .filter(filename => !currentState.pendingDeletes.includes(filename));
        formData.append('imageOrder', JSON.stringify(currentImages));

        return formData;
      };

      const doSave = async () => {
        try {
          await handleImageDeletions();
          const formData = prepareFormData(title);

          if (saveStatus) {
            saveStatus.style.display = 'flex';
            saveStatus.querySelector('.status-text').textContent = '正在保存...';
          }

          const response = await makeAuthenticatedRequest(window.location.pathname, {
            method: 'POST',
            body: formData
          });

          if (response?.success) {
            if (saveStatus) {
              saveStatus.querySelector('.status-text').textContent = '保存成功';
              setTimeout(() => {
                saveStatus.style.display = 'none';
                window.location.href = '/admin';
              }, 500);
            } else {
              window.location.href = '/admin';
            }
          } else {
            throw new Error(response?.error || '保存失败');
          }
        } catch (error) {
          handleSaveError(error);
        }
      };

      doSave();
    });
  }

  // Cancel button handler
  const cancelBtn = document.querySelector('.cancel-btn[data-action="cancel"]');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!hasChanges || confirm('确定要取消编辑吗？所有更改将会丢失')) {
        window.location.href = '/admin';
      }
    });
  }

  // Network status handlers
  window.addEventListener('online', () => {
    console.log('网络连接已恢复');
    if (saveStatus) saveStatus.style.display = 'none';
  });

  window.addEventListener('offline', () => {
    console.log('网络连接已断开');
    alert('网络连接已断开，请保存您的更改');
  });

  // 初始化
  initializeState();
});