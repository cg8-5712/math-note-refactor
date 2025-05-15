function showFullscreen(img) {
    const fullscreenDiv = document.createElement('div');
    fullscreenDiv.className = 'fullscreen';
    const fullscreenImg = document.createElement('img');
    fullscreenImg.src = img.src;
    fullscreenDiv.appendChild(fullscreenImg);
    
    fullscreenDiv.onclick = function() {
        fullscreenDiv.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(fullscreenDiv);
        }, 300); // Wait for transition to complete
    };
    
    document.body.appendChild(fullscreenDiv);
    // Trigger reflow to ensure transition works
    fullscreenDiv.offsetHeight;
    fullscreenDiv.classList.add('active');
}