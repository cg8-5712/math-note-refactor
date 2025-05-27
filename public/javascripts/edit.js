document.addEventListener('DOMContentLoaded', function() {
  let hasChanges = false;
  let originalImages = [];
  const imageGrid = document.getElementById('sortableImages');
  
  // Store original state
  if (imageGrid) {
    originalImages = Array.from(imageGrid.querySelectorAll('.image-item')).map(item => ({
      filename: item.querySelector('.delete-image').dataset.filename,
      src: item.querySelector('img').src
    }));
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
          const response = await fetch(`${window.location.pathname}/restore`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': document.querySelector('input[name="_csrf"]').value
            },
            body: JSON.stringify({ originalImages })
          });

          if (!response.ok) {
            throw new Error('恢复失败');
          }

          window.location.href = '/admin';
        } catch (error) {
          console.error('恢复状态失败:', error);
          alert('恢复原始状态失败，请重试');
        }
      }
    });
  }

  // Handle image changes
  const handleStateChange = () => {
    hasChanges = true;
  };

  // Image upload handler
  const imageUpload = document.getElementById('imageUpload');
  imageUpload.addEventListener('change', async (e) => {
    await handleImageUpload(e);
    handleStateChange();
  });

  // Delete image handler
  document.querySelectorAll('.delete-image').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const result = await handleImageDelete.call(btn, e);
      if (result && result.success) {
        handleStateChange();
      }
    });
  });

  // Initialize sortable
  if (imageGrid) {
    new Sortable(imageGrid, {
      animation: 150,
      onEnd: () => {
        handleStateChange();
        updateImageOrder();
      }
    });
  }
});

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': form.querySelector('[name="_csrf"]').value
      },
      body: JSON.stringify({
        title: form.querySelector('#title').value,
        _method: 'PUT'
      })
    });

    if (response.ok) {
      window.location.href = '/admin';
    } else {
      const data = await response.json();
      alert(data.error || '保存失败');
    }
  } catch (error) {
    console.error('保存出错:', error);
    alert('保存失败，请重试');
  }
}

async function handleImageUpload(e) {
  const files = e.target.files;
  const formData = new FormData();
  
  for (let file of files) {
    formData.append('images', file);
  }
  
  try {
    const response = await fetch(window.location.pathname + '/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-Token': document.querySelector('input[name="_csrf"]').value
      }
    });
    
    if (response.ok) {
      window.location.reload();
    } else {
      alert('上传失败，请重试');
    }
  } catch (err) {
    console.error('上传错误:', err);
    alert('上传出错，请重试');
  }
}

async function handleImageDelete(e) {
  e.preventDefault();
  e.stopPropagation(); // 阻止事件冒泡
  
  if (!confirm('确定要删除这张图片吗？')) {
    return;
  }

  const filename = this.dataset.filename;
  try {
    const response = await fetch(`${window.location.pathname}/images/${filename}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': document.querySelector('input[name="_csrf"]').value
      }
    });
    
    if (response.ok) {
      this.closest('.image-item').remove();
    } else {
      const data = await response.json();
      alert(data.error || '删除失败，请重试');
    }
  } catch (err) {
    console.error('删除错误:', err);
    alert('删除出错，请重试');
  }
}

async function handleImageUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const formData = new FormData();
  
  for (let file of files) {
    formData.append('images', file);
  }
  
  try {
    const response = await fetch(`${window.location.pathname}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-Token': document.querySelector('input[name="_csrf"]').value
      }
    });
    
    if (response.ok) {
      window.location.reload();
    } else {
      const data = await response.json();
      alert(data.error || '上传失败，请重试');
    }
  } catch (err) {
    console.error('上传错误:', err);
    alert('上传出错，请重试');
  }
}

async function updateImageOrder() {
  const imageItems = Array.from(document.querySelectorAll('.image-item img'));
  if (!imageItems.length) return;

  const images = imageItems.map(img => {
    const src = img.getAttribute('src');
    return src.split('/').pop(); // 获取文件名
  });

  try {
    const response = await fetch(`${window.location.pathname}/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('input[name="_csrf"]').value
      },
      body: JSON.stringify({ images })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || '更新顺序失败');
    }
  } catch (err) {
    console.error('重排序错误:', err);
    alert('更新图片顺序失败，请重试');
  }
}

// Move handleCancel function near other handlers
async function handleCancel(e) {
  e.preventDefault();
  if (confirm('确定要取消编辑吗？未保存的更改将会丢失')) {
    window.location.href = '/admin';
  }
}