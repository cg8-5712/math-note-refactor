document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('newNoteForm');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const dateInput = form.querySelector('input[name="date"]');
      const titleInput = form.querySelector('input[name="title"]');
      
      if (!dateInput.value.match(dateInput.pattern)) {
        alert('请输入正确的日期格式（MMDD）');
        dateInput.focus();
        return;
      }
      
      if (!titleInput.value.trim()) {
        alert('标题不能为空');
        titleInput.focus();
        return;
      }

      try {
        // 修复 URL 构建
        const response = await fetch(form.action, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            date: dateInput.value,
            title: titleInput.value.trim()
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '创建失败');
        }

        // 创建成功后刷新页面
        window.location.reload();
      } catch (error) {
        console.error('创建笔记失败:', error);
        alert(error.message || '创建失败，请重试');
      }
    });
  }

  // Delete note handler
  window.deleteNote = async function(date) {
    if (!confirm('确定要删除这条笔记吗？')) {
      return;
    }

    try {
      const response = await fetch(`/admin/${date}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '删除失败');
      }

      window.location.reload();
    } catch (error) {
      console.error('删除笔记失败:', error);
      alert(error.message || '删除失败，请重试');
    }
  };
});