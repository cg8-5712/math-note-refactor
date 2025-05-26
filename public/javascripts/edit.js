document.addEventListener('DOMContentLoaded', function() {
  // Initialize sortable for images
  const sortable = new Sortable(document.getElementById('sortableImages'), {
    animation: 150,
    onEnd: function(evt) {
      updateImageOrder();
    }
  });

  // Image upload handling
  const imageUpload = document.getElementById('imageUpload');
  imageUpload.addEventListener('change', async function(e) {
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
  });

  // Delete image handling
  document.querySelectorAll('.delete-image').forEach(btn => {
    btn.addEventListener('click', async function() {
      if (confirm('确定要删除这张图片吗？')) {
        const filename = this.dataset.filename;
        try {
          const response = await fetch(`${window.location.pathname}/image/${filename}`, {
            method: 'DELETE',
            headers: {
              'X-CSRF-Token': document.querySelector('input[name="_csrf"]').value
            }
          });
          
          if (response.ok) {
            this.closest('.image-item').remove();
          } else {
            alert('删除失败，请重试');
          }
        } catch (err) {
          console.error('删除错误:', err);
          alert('删除出错，请重试');
        }
      }
    });
  });

  // Update image order
  async function updateImageOrder() {
    const images = Array.from(document.querySelectorAll('.image-item')).map(
      item => item.querySelector('img').src.split('/').pop()
    );
    
    try {
      await fetch(window.location.pathname + '/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('input[name="_csrf"]').value
        },
        body: JSON.stringify({ images })
      });
    } catch (err) {
      console.error('重排序错误:', err);
      alert('更新图片顺序失败，请重试');
    }
  }
});