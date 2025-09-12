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
async function loadConfig() {
  try {
    const response = await fetch('config.json'); // 保持 JSON
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    config = await response.json();                // 解析 JSON
    initializeWebsite();
  } catch (error) {
    console.error('載入設定檔失敗:', error);
    showError('無法載入設定檔，請確認 config.json 存在且格式正確');
  }
}


// 初始化網站內容
function initializeWebsite() {
    try {
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
    console.log(info.title.split('\n'));
    
    // 設定聯絡信箱
    if (info.email) {
        document.getElementById('contact-email').href = `mailto:${info.email}`;
    }
    
    // 生成個人資訊
    const profileInfo = document.getElementById('profile-info');
    let infoHTML = '';
    
    if (info.email) {
        infoHTML += `
            <div class="info-item">
                <svg class="info-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
                <span>${info.email}</span>
            </div>
        `;
    }
    
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
    
    if (info.phone) {
        infoHTML += `
            <div class="info-item">
                <svg class="info-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                </svg>
                <span>${info.phone}</span>
            </div>
        `;
    }
    
    if (info.website) {
        infoHTML += `
            <div class="info-item">
                <svg class="info-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.499-.948-.737-1.182C10.232 4.032 10.076 4 10 4z" clip-rule="evenodd"></path>
                </svg>
                <span><a href="${info.website}" target="_blank" style="color: inherit;">${info.website}</a></span>
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
    
    for (const [platform, url] of Object.entries(socialLinks)) {
        if (url) {
            const displayText = socialMap[platform] || platform.charAt(0).toUpperCase();
            socialHTML += `
                <a href="${url}" target="_blank" class="social-link" title="${platform}">
                    ${displayText}
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
        backend: '後端開發', 
        tools: '開發工具',
        mobile: '行動開發',
        database: '資料庫',
        cloud: '雲端服務'
    };
    return categoryMap[category] || category;
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
    const carouselContainer = document.getElementById('carousel-container');
    
    let slidesHTML = '';
    let navDotsHTML = '';
    
    filteredProjects.forEach((project, index) => {
        const backgroundImage = project.image ? `background-image: url('${project.image}');` : '';
        
        slidesHTML += `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}" style="${backgroundImage}">
                <div class="slide-overlay">
                    <div class="slide-content">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="slide-links">
                            ${project.demo_url ? `<a href="${project.demo_url}" target="_blank" class="slide-link">查看 Demo</a>` : ''}
                            ${project.github_url ? `<a href="${project.github_url}" target="_blank" class="slide-link">GitHub</a>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        navDotsHTML += `
            <div class="nav-dot ${index === 0 ? 'active' : ''}" onclick="currentSlide(${index + 1})"></div>
        `;
    });
    
    carouselContainer.innerHTML = `
        ${slidesHTML}
        <button class="carousel-arrow prev" onclick="changeSlide(-1)">‹</button>
        <button class="carousel-arrow next" onclick="changeSlide(1)">›</button>
        <div class="carousel-nav">
            ${navDotsHTML}
        </div>
    `;
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
        <h4>${project.title}</h4>
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