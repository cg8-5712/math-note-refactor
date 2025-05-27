document.addEventListener('DOMContentLoaded', function() {
  // Form submission handling
  const editForm = document.getElementById('editForm');
  editForm.addEventListener('submit', handleSubmit);

  // Initialize sortable for images
  const sortable = new Sortable(document.getElementById('sortableImages'), {
    animation: 150,
    onEnd: updateImageOrder
  });

  // Image upload handling
  const imageUpload = document.getElementById('imageUpload');
  imageUpload.addEventListener('change', handleImageUpload);

  // Delete image buttons
  document.querySelectorAll('.delete-image').forEach(btn => {
    btn.addEventListener('click', handleImageDelete);
  });
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
  e.preventDefault(); // 添加这行防止事件冒泡
  
  const confirmed = confirm('确定要删除这张图片吗？');
  if (!confirmed) {
    return; // 如果用户点击取消，直接返回
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