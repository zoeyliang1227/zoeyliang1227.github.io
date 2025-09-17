// 全域變數
let config = {};
let currentSlideIndex = 0;
let filteredProjects = [];
let autoSlideInterval;

// 初始化網站
document.addEventListener('DOMContentLoaded', function() {
    loadConfig();
});

// 載入並解析 json 設定檔
// async function loadConfig() {
//   try {
//     const response = await fetch('config.json'); // 保持 JSON
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     config = await response.json();                // 解析 JSON
//     initializeWebsite();
//   } catch (error) {
//     console.error('載入設定檔失敗:', error);
//     showError('無法載入設定檔，請確認 config.json 存在且格式正確');
//   }
// }
async function loadConfig() {
  try {
    // 同時載入三個配置檔
    const [configResponse, manifestResponse, portfolioResponse] = await Promise.all([
      fetch('config/config.json'),
      fetch('config/manifest.json'),
      fetch('config/portfolio.json')
    ]);

    // 檢查所有回應狀態
    if (!configResponse.ok || !manifestResponse.ok || !portfolioResponse.ok) {
      throw new Error('部分配置檔載入失敗');
    }

    // 解析所有 JSON
    const [configData, manifestData, portfolioData] = await Promise.all([
      configResponse.json(),
      manifestResponse.json(),
      portfolioResponse.json()
    ]);

    // 合併配置物件
    config = {
      ...configData,
      ...manifestData,
      portfolio: Array.isArray(portfolioData) ? portfolioData : portfolioData.portfolio || []
    };

    initializeWebsite();
  } catch (error) {
    console.error('無法載入設定檔，請確認所有配置檔存在且格式正確');
    console.error('網站初始化失敗，請檢查設定檔格式');
  }
}


// 初始化網站內容
function initializeWebsite() {
    try {
        console.log("🚀 載入後的 config:", config); // 先看看結構
        // 設定網站標題和 meta 資訊
        if (config.site_config) {
            document.getElementById('site-title').innerHTML = config.site_config.title;
            document.getElementById('site-description').content = config.site_config.description;
            document.getElementById('site-keywords').content = config.site_config.keywords;
            document.getElementById('site-author').content = config.site_config.author;
            document.documentElement.lang = config.site_config.language;
        }

        // 載入個人資料
        loadPersonalInfo();
        
        // 載入社群連結
        loadSocialLinks();
        
        // 載入技能
        loadSkills();

        // 載入連絡我
        loadScontact();
        
        // 載入作品集
        filteredProjects = config.portfolio || [];
        loadPortfolio();
        
        // 隱藏載入畫面
        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-container').classList.add('loaded');
        
        // 初始化輪播
        initializeCarousel();
        
        // 綁定事件監聽器
        bindEventListeners();
        
    } catch (error) {
        console.error('初始化網站失敗:', error);
        showError('網站初始化失敗，請檢查設定檔格式');
    }
}

// 載入個人資料
function loadPersonalInfo() {
    const info = config.personal_info;
    if (!info) return;
    
    // 設定頭像
    const avatarElement = document.getElementById('profile-avatar');
    if (info.avatar && (info.avatar.startsWith('./') || info.avatar.startsWith('http'))) {
        avatarElement.innerHTML = `<img src="${info.avatar}" alt="${info.name}" onerror="this.parentElement.innerHTML='👨‍💻'">`;
    } else if (info.avatar) {
        avatarElement.innerHTML = info.avatar;
    }
    
    // 設定姓名和職稱
    document.getElementById('profile-name').innerHTML = info.name || '姓名載入中...';
    document.getElementById('profile-title').innerHTML  = (info.title || '職稱載入中...').replace(/\r\n|\r|\n/g, '<br>');
    
    // 生成個人資訊
    const profileInfo = document.getElementById('profile-info');
    let infoHTML = '';
    
    if (info.location) {
        infoHTML += `
            <div class="info-item">
                <svg class="info-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                </svg>
                <span>${info.location}</span>
            </div>
        `;
    }
    
    if (info.experience) {
        infoHTML += `
            <div class="info-item">
                <svg class="info-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                </svg>
                <span>${info.experience}</span>
            </div>
        `;
    }

    profileInfo.innerHTML = infoHTML;
}

// 載入社群連結
function loadSocialLinks() {
    const socialLinks = config.social_links;
    if (!socialLinks) return;
    
    const socialContainer = document.getElementById('social-links');
    let socialHTML = '';
    
    const socialMap = {
        github: 'github',
        linkedin: 'linkedin',   
    };

    const socialIcons = {
        github: '<path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.21 11.44c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.41-1.34-1.79-1.34-1.79-1.09-.74.08-.73.08-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.48-1.34-5.48-5.94 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.64-5.49 5.93.43.38.81 1.12.81 2.26v3.35c0 .32.22.7.82.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z"/>',
        linkedin: '<path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zM8.5 8h3.82v2.56h.05c.53-1 1.83-2.06 3.77-2.06C21.36 8.5 24 11.24 24 16.06V24h-4v-7.4c0-1.76-.03-4.04-2.46-4.04-2.47 0-2.85 1.93-2.85 3.92V24h-4V8z"/>',
    };
    
    for (const [platform, url] of Object.entries(socialLinks)) {
        if (url) {
            const iconPath = socialIcons[platform] || '';
            socialHTML += `
                <a href="${url}" target="_blank" title="${platform}" class="social-link">
                    <div class="social-link">
                        <svg class="social-link svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            ${iconPath}
                        </svg>
                    </div>    
                </a>
                    
            `;
        }
    }
    socialContainer.innerHTML = socialHTML;
}

// 載入技能
function loadSkills() {
    const skills = config.skills;
    if (!skills) return;
    
    const skillsContainer = document.getElementById('skills-section');
    let skillsHTML = '<h3>技能專長</h3>';
    
    for (const [category, skillList] of Object.entries(skills)) {
        if (Array.isArray(skillList) && skillList.length > 0) {
            skillsHTML += `
                <div class="skill-category">
                    <h4>${getCategoryDisplayName(category)}</h4>
                    <div class="skill-tags">
                        ${skillList.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    skillsContainer.innerHTML = skillsHTML;
}

// 取得技能分類顯示名稱
function getCategoryDisplayName(category) {
    const categoryMap = {
        programming: '程式語言 / 自動化開發語言', 
        tools: '自動化測試工具',
        management: '測試管理 / 規劃工具',
        control: '版本控制 / CI',
        types: '測試類型'
    };
    return categoryMap[category] || category;
}

// 載入聯絡我
function loadScontact() {
    const contact = config.contact;
    if (!contact) return;
    
    const contactContainer = document.getElementById('contact-buttons');

contactContainer.innerHTML = `
    <a href="mailto:${contact.email}" class="contact-btn primary" id="contact-email">聯絡我</a>
    <a href="${contact.resume}" class="contact-btn secondary">下載履歷</a>
`;
}

// 載入作品集
function loadPortfolio() {
    if (!config.portfolio || config.portfolio.length === 0) {
        document.getElementById('carousel-container').innerHTML = '<p>暫無作品展示</p>';
        return;
    }
    
    // 載入分類篩選器
    loadPortfolioFilter();
    
    // 載入輪播內容
    loadCarouselSlides();
    
    // 載入第一個作品的詳細資訊
    if (filteredProjects.length > 0) {
        updateProjectDetails(0);
    }
}

// 載入作品集篩選器
function loadPortfolioFilter() {
    const categories = ['全部', ...new Set(config.portfolio.map(project => project.category))];
    const filterContainer = document.getElementById('portfolio-filter');
    
    let filterHTML = '';
    categories.forEach((category, index) => {
        filterHTML += `
            <button class="filter-btn ${index === 0 ? 'active' : ''}" 
                    onclick="filterProjects('${category}')">
                ${category}
            </button>
        `;
    });
    
    filterContainer.innerHTML = filterHTML;
}

// 篩選作品
function filterProjects(category) {
    // 更新篩選按鈕狀態
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 篩選作品
    if (category === '全部') {
        filteredProjects = config.portfolio;
    } else {
        filteredProjects = config.portfolio.filter(project => project.category === category);
    }
    
    // 重新載入輪播
    currentSlideIndex = 0;
    loadCarouselSlides();
    updateProjectDetails(0);
    
    // 重新初始化輪播
    initializeCarousel();
}

// 載入輪播投影片
function loadCarouselSlides() {
    console.log('loadCarouselSlides() 被呼叫了！');
    console.log('filteredProjects:', filteredProjects);
    
    const carouselContainer = document.getElementById('carousel-container');
    console.log('carouselContainer:', carouselContainer);

    // 如果資料還沒準備好，延遲重試
    if (!filteredProjects || filteredProjects.length === 0) {
        console.log('資料尚未準備，0.5秒後重試...');
        setTimeout(loadCarouselSlides, 500);
        return;
    }
    
    let slidesHTML = '';
    let navDotsHTML = '';
    
    filteredProjects.forEach((project, index) => {
        console.log(`處理專案 ${index}:`, project);
        
        // 同時支援 media 和 image 屬性
        const mediaUrl = project.media || project.image;
        console.log(`專案 ${index} 的媒體URL:`, mediaUrl);
        
        const mediaHTML = getMediaContent(mediaUrl);
        
        slidesHTML += `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}">
                ${mediaHTML}
                <div class="slide-overlay">
                    <div class="slide-content">
                        <h3 class="project-title">${project.title}</h3>
                    </div>
                </div>
            </div>
        `;
        
        navDotsHTML += `
            <div class="nav-dot ${index === 0 ? 'active' : ''}" onclick="currentSlide(${index + 1})"></div>
        `;
    });
    
    console.log('準備更新 carouselContainer.innerHTML');
    carouselContainer.innerHTML = `
        ${slidesHTML}
        <button class="carousel-arrow prev" onclick="changeSlide(-1)">‹</button>
        <button class="carousel-arrow next" onclick="changeSlide(1)">›</button>
        <div class="carousel-nav">
            ${navDotsHTML}
        </div>
    `;
    console.log('carouselContainer.innerHTML 更新完成');
}

function getMediaContent(mediaUrl) {
    if (!mediaUrl) {
        return '<div class="slide-placeholder">無媒體內容</div>';
    }
    
    // 除錯：顯示媒體 URL
    console.log('Media URL:', mediaUrl);
    
    // 獲取文件擴展名
    const extension = mediaUrl.split('.').pop().toLowerCase();
    console.log('Extension:', extension);
    
    // 判斷是否為影片格式
    const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'm4v'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    
    if (videoExtensions.includes(extension)) {
        // 影片格式
        let videoType = extension;
        if (extension === 'mov') videoType = 'quicktime';
        if (extension === 'm4v') videoType = 'mp4';
        
        console.log('Creating video element for:', mediaUrl);
        
        return `
            <video class="slide-video" autoplay muted loop playsinline style="width: 100%; height: 100%; object-fit: cover;" 
                   onerror="console.error('Video load error:', this.src); this.outerHTML='<div class=&quot;slide-placeholder&quot;>影片載入失敗: ${mediaUrl}</div>'">
                <source src="${mediaUrl}" type="video/${videoType}">
                您的瀏覽器不支援影片播放
            </video>
        `;
    } else if (imageExtensions.includes(extension)) {
        // 圖片格式
        console.log('Creating image element for:', mediaUrl);
        return `
            <div class="slide-image" style="width: 100%; height: 100%; background-image: url('${mediaUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;"></div>
        `;
    } else {
        // 未知格式，嘗試作為圖片處理，如果失敗則顯示錯誤
        console.log('Unknown format, trying as image:', mediaUrl);
        return `
            <img class="slide-unknown" src="${mediaUrl}" alt="專案媒體" 
                 style="width: 100%; height: 100%; object-fit: cover;"
                 onerror="this.outerHTML='<div class=&quot;slide-placeholder&quot;>無法載入媒體格式: .${extension}</div>'">
        `;
    }
}

// 初始化輪播功能
function initializeCarousel() {
    // 清除之前的自動輪播
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
    
    // 設定自動輪播
    if (filteredProjects.length > 1) {
        autoSlideInterval = setInterval(() => {
            changeSlide(1);
        }, 5000);
    }
    
    // 綁定鍵盤事件
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// 處理鍵盤導航
function handleKeyboardNavigation(e) {
    if (e.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeSlide(1);
    }
}

// 顯示指定的投影片
function showSlide(index) {
    if (filteredProjects.length === 0) return;
    
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.nav-dot');
    
    // 移除所有 active 類別
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // 添加 active 類別到當前投影片
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (dots[index]) {
        dots[index].classList.add('active');
    }
    
    // 更新作品詳細資訊
    updateProjectDetails(index);
}

// 切換投影片
function changeSlide(direction) {
    if (filteredProjects.length === 0) return;
    
    currentSlideIndex += direction;
    
    if (currentSlideIndex >= filteredProjects.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = filteredProjects.length - 1;
    }
    
    showSlide(currentSlideIndex);
}

// 跳轉到指定投影片
function currentSlide(slideNumber) {
    currentSlideIndex = slideNumber - 1;
    showSlide(currentSlideIndex);
}

// 更新作品詳細資訊
function updateProjectDetails(index) {
    const project = filteredProjects[index];
    if (!project) return;
    
    const detailsContainer = document.getElementById('project-details');
    
    let metaHTML = '';
    if (project.category) {
        metaHTML += `<span>分類：${project.category}</span>`;
    }
    if (project.date) {
        metaHTML += `<span>日期：${project.date}</span>`;
    }
    
    let techHTML = '';
    if (project.technologies && Array.isArray(project.technologies)) {
        techHTML = project.technologies.map(tech => 
            `<span class="tech-tag">${tech}</span>`
        ).join('');
    }
    
    detailsContainer.innerHTML = `
        <div class="project-header">
            <h4>${project.title}
            ${project.github_url ? `<a href="${project.github_url}" target="_blank" class="slide-link">GitHub</a>` : ''}
            </h4>
        </div>
        ${metaHTML ? `<div class="project-meta">${metaHTML}</div>` : ''}
        <p>${project.detailed_description || project.description}</p>
        ${techHTML ? `<div class="project-tech">${techHTML}</div>` : ''}
    `;
}

// 綁定事件監聽器
function bindEventListeners() {
    // 滑鼠懸停時暫停自動輪播
    const carouselContainer = document.getElementById('carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
            }
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            if (filteredProjects.length > 1) {
                autoSlideInterval = setInterval(() => {
                    changeSlide(1);
                }, 5000);
            }
        });
    }
    
    // 處理觸控滑動
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (carouselContainer) {
        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        carouselContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                changeSlide(1); // 向左滑，下一張
            } else {
                changeSlide(-1); // 向右滑，上一張
            }
        }
    }
}

// 工具函數：防抖動
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

// 工具函數：節流
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 處理窗口大小變化
window.addEventListener('resize', debounce(() => {
    // 可以在這裡添加響應式處理邏輯
}, 250));

// 平滑捲動到指定元素
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 檢查元素是否在視窗中
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// 添加滾動動畫效果
function addScrollAnimations() {
    const animatedElements = document.querySelectorAll('.skill-tag, .info-item, .contact-btn');
    
    function checkAnimations() {
        animatedElements.forEach(element => {
            if (isElementInViewport(element) && !element.classList.contains('animated')) {
                element.classList.add('animated');
                element.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }
    
    window.addEventListener('scroll', throttle(checkAnimations, 100));
    checkAnimations(); // 初始檢查
}

// 當 DOM 完全載入後執行滾動動畫
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(addScrollAnimations, 1000);
});

// 全域函數，供 HTML 中的 onclick 事件使用
window.changeSlide = changeSlide;
window.currentSlide = currentSlide;
window.filterProjects = filterProjects;