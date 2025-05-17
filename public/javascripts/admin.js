document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('imageEditor');
    const imageGrid = document.getElementById('sortableImages');
    let currentEditDate = null;

    // Initialize Sortable
    let sortable = null;

    // Edit functionality
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const row = this.closest('tr');
            const date = row.dataset.date;
            currentEditDate = date;
            
            // Show text edit controls
            row.querySelector('.note-title').style.display = 'none';
            row.querySelector('.edit-title').style.display = 'inline';
            this.style.display = 'none';
            row.querySelector('.save-btn').style.display = 'inline';

            // Show image editor modal
            modal.style.display = 'block';
            await loadImages(date);
        });
    });

    // Close modal
    document.querySelector('.close-modal').onclick = () => {
        modal.style.display = 'none';
        currentEditDate = null;
    };

    // Image upload handling
    document.getElementById('imageUpload').addEventListener('change', async (e) => {
        const files = e.target.files;
        if (!files.length || !currentEditDate) return;

        const formData = new FormData();
        for (let file of files) {
            formData.append('images', file);
        }

        try {
            const response = await fetch(`/admin/notes/${currentEditDate}/images`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                await loadImages(currentEditDate);
            }
        } catch (error) {
            alert('上传失败');
        }
    });

    // Load images for a date
    async function loadImages(date) {
        try {
            const response = await fetch(`/admin/notes/${date}/images`);
            const images = await response.json();
            
            imageGrid.innerHTML = images.map(img => `
                <div class="image-preview-item" data-image="${img}">
                    <img src="/images/${date}/${img}" alt="板书图片">
                    <button class="delete-image" onclick="deleteImage('${date}', '${img}')">&times;</button>
                </div>
            `).join('');

            // Initialize sortable
            if (sortable) {
                sortable.destroy();
            }
            sortable = new Sortable(imageGrid, {
                animation: 150,
                ghostClass: 'dragging',
                onEnd: async (evt) => {
                    const images = Array.from(imageGrid.children).map(
                        item => item.dataset.image
                    );
                    await updateImageOrder(date, images);
                }
            });
        } catch (error) {
            console.error('Failed to load images:', error);
        }
    }

    // Update image order
    async function updateImageOrder(date, images) {
        try {
            await fetch(`/admin/notes/${date}/images/order`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ images })
            });
        } catch (error) {
            alert('更新顺序失败');
        }
    }

    // Delete image
    window.deleteImage = async (date, image) => {
        if (!confirm('确定要删除这张图片吗？')) return;

        try {
            const response = await fetch(`/admin/notes/${date}/images/${image}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await loadImages(date);
            }
        } catch (error) {
            alert('删除失败');
        }
    };

    // Save functionality
    document.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const row = this.closest('tr');
            const date = row.dataset.date;
            const newTitle = row.querySelector('.edit-title').value;

            try {
                const response = await fetch(`/admin/notes/${date}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title: newTitle }),
                });

                if (response.ok) {
                    row.querySelector('.note-title').textContent = newTitle;
                    row.querySelector('.note-title').style.display = 'inline';
                    row.querySelector('.edit-title').style.display = 'none';
                    this.style.display = 'none';
                    row.querySelector('.edit-btn').style.display = 'inline';
                }
            } catch (error) {
                alert('更新失败');
            }
        });
    });

    // Delete functionality
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (!confirm('确定要删除这条记录吗？')) return;
            
            const row = this.closest('tr');
            const date = row.dataset.date;

            try {
                const response = await fetch(`/admin/notes/${date}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    row.remove();
                }
            } catch (error) {
                alert('删除失败');
            }
        });
    });

});

async function deleteNote(date) {
    if (!confirm('确定要删除这条笔记吗？')) {
        return;
    }

    try {
        const response = await fetch(`/admin/${date}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('删除失败');
        }

        const data = await response.json();
        if (data.success) {
            // 删除成功后刷新页面
            window.location.reload();
        } else {
            throw new Error(data.error || '删除失败');
        }
    } catch (error) {
        console.error('Delete failed:', error);
        alert('删除失败: ' + error.message);
    }
};