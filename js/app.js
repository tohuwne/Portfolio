function checkDiagramImage(img) {
    if (img.naturalWidth > 0) {
        img.style.display = 'block';
        const wrapper = img.nextElementSibling;
        if (wrapper && wrapper.classList.contains('placeholder-fallback-wrapper')) {
            wrapper.style.display = 'none';
        }
    } else {
        img.style.display = 'none';
        const wrapper = img.nextElementSibling;
        if (wrapper && wrapper.classList.contains('placeholder-fallback-wrapper')) {
            wrapper.style.display = 'block';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Switcher
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        themeToggleBtn.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    } else {
        // Sub-pages apply theme automatically based on localStorage
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
    }

    // 2. Responsive Mobile Menu (Homepage only)
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = navLinks.classList.contains('active') ? 'rotate(45deg) translate(6px, 6px)' : 'none';
            spans[1].style.opacity = navLinks.classList.contains('active') ? '0' : '1';
            spans[2].style.transform = navLinks.classList.contains('active') ? 'rotate(-45deg) translate(5px, -5px)' : 'none';
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // 3. Header Scroll effect (Homepage only)
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 4. File Explorer UI logic (Detailed pages)
    const treeItems = document.querySelectorAll('.tree-item');
    const fileContents = document.querySelectorAll('.file-content');
    const pathTextSpan = document.getElementById('current-path-text');

    const PATH_MAPS = {
        'usecase': 'Sơ đồ UML / Sơ đồ Use Case',
        'activity': 'Sơ đồ UML / Sơ đồ Hoạt động (Activity)',
        'sequence': 'Sơ đồ UML / Sơ đồ Trình tự (Sequence)',
        'erd': 'Cơ sở dữ liệu / Sơ đồ thực thể ERD',
        'schema-table': 'Cơ sở dữ liệu / Đặc tả bảng dữ liệu',
        'persona': 'Nghiên cứu & Phân tích / User Persona',
        'empathy': 'Nghiên cứu & Phân tích / Empathy Map',
        'userflow': 'Khung dây & Luồng đi / User Flow Diagram',
        'wireframe': 'Khung dây & Luồng đi / Low-Fi Wireframes',
        'mockup-screen': 'Thiết kế Hoàn chỉnh / Trình giả lập Mockup',
        
        // JAVI details
        'usecase-tong-the': 'Sơ đồ Use Case / Mức tổng thể',
        'usecase-ql-khach-hang': 'Sơ đồ Use Case / QL Khách hàng',
        'usecase-ql-don-hang': 'Sơ đồ Use Case / QL Đơn hàng',
        'usecase-ql-san-pham': 'Sơ đồ Use Case / QL Sản phẩm',
        'usecase-ql-phieu-thu': 'Sơ đồ Use Case / QL Phiếu thu',
        'usecase-ql-loai-san-pham': 'Sơ đồ Use Case / QL Loại sản phẩm',
        'usecase-ql-hoa-don': 'Sơ đồ Use Case / QL Hóa đơn',
        'usecase-ql-phieu-xuat': 'Sơ đồ Use Case / QL Phiếu xuất',
        'usecase-ql-tai-khoan': 'Sơ đồ Use Case / QL Tài khoản',
        'usecase-ql-loai-khach-hang': 'Sơ đồ Use Case / QL Loại khách hàng',
        'activity-dang-nhap': 'Sơ đồ Hoạt động / Đăng nhập',
        'activity-tao-hoa-don': 'Sơ đồ Hoạt động / Tạo hóa đơn',
        'activity-tao-don-hang': 'Sơ đồ Hoạt động / Tạo đơn hàng',
        'activity-them-phieu-xuat': 'Sơ đồ Hoạt động / Thêm phiếu xuất',
        'activity-them-phieu-thu': 'Sơ đồ Hoạt động / Thêm phiếu thu',
        'sequence-dang-nhap': 'Sơ đồ Trình tự / Đăng nhập',
        'sequence-tao-don-hang': 'Sơ đồ Trình tự / Tạo đơn hàng',
        'sequence-them-phieu-xuat': 'Sơ đồ Trình tự / Thêm phiếu xuất',
        'sequence-them-hoa-don': 'Sơ đồ Trình tự / Thêm hóa đơn',
        'sequence-them-phieu-thu': 'Sơ đồ Trình tự / Thêm phiếu thu',
        'collaboration-dang-nhap': 'Sơ đồ Cộng tác / Đăng nhập',
        'collaboration-them-phieu-xuat': 'Sơ đồ Cộng tác / Thêm phiếu xuất',
        'collaboration-them-phieu-thu': 'Sơ đồ Cộng tác / Thêm phiếu thu',
        'collaboration-tao-don-hang': 'Sơ đồ Cộng tác / Tạo đơn hàng',
        'collaboration-tao-hoa-don': 'Sơ đồ Cộng tác / Tạo hóa đơn',
        'state-don-hang': 'Sơ đồ Trạng thái / Đơn hàng',
        'state-hoa-don': 'Sơ đồ Trạng thái / Hóa đơn',
        'state-cong-no': 'Sơ đồ Trạng thái / Công nợ',
        'class-diagram': 'Cơ sở dữ liệu & Cấu trúc / Sơ đồ lớp',
        'database-diagram': 'Cơ sở dữ liệu & Cấu trúc / Database Diagram',
        'dfd-level-0': 'Luồng dữ liệu DFD / DFD Mức 0',
        'dfd-level-1': 'Luồng dữ liệu DFD / DFD Mức 1',
        'dfd-level-2-1': 'Luồng dữ liệu DFD / DFD Mức 2 - Ảnh 1',
        'dfd-level-2-2': 'Luồng dữ liệu DFD / DFD Mức 2 - Ảnh 2',
        'dfd-level-2-3': 'Luồng dữ liệu DFD / DFD Mức 2 - Ảnh 3',
        'dfd-level-2-4': 'Luồng dữ liệu DFD / DFD Mức 2 - Ảnh 4',

        // VibeTicket details
        'userflow-dang-ky-dang-nhap': 'Luồng người dùng / Đăng ký - Đăng nhập',
        'userflow-tim-kiem-loc-su-kien': 'Luồng người dùng / Tìm kiếm & Lọc sự kiện',
        'userflow-dat-ve': 'Luồng người dùng / Đặt vé',
        'userflow-thanh-toan': 'Luồng người dùng / Thanh toán',
        'userflow-quan-ly-vi-ve-voucher': 'Luồng người dùng / Quản lý Ví vé & Voucher',
        'wireframe-dang-nhap': 'Khung bản phác thảo / Trang đăng nhập',
        'wireframe-trang-chu': 'Khung bản phác thảo / Trang chủ',
        'wireframe-chi-tiet-su-kien': 'Khung bản phác thảo / Chi tiết sự kiện',
        'wireframe-chon-cho-ngoi': 'Khung bản phác thảo / Chọn chỗ ngồi',
        'wireframe-chi-tiet-ve': 'Khung bản phác thảo / Chi tiết vé',
        'wireframe-trang-thanh-toan': 'Khung bản phác thảo / Trang thanh toán',
        'wireframe-vi-ve': 'Khung bản phác thảo / Ví vé',
        'wireframe-kho-voucher': 'Khung bản phác thảo / Kho voucher',
        'video-demo': 'Giao diện UI hoàn chỉnh / Video Demo',
        'ui-dang-ky': 'Giao diện UI hoàn chỉnh / Màn hình đăng ký',
        'ui-dang-nhap': 'Giao diện UI hoàn chỉnh / Màn hình đăng nhập',
        'ui-trang-chu-chua-dang-nhap': 'Giao diện UI hoàn chỉnh / Màn hình trang chủ (Chưa đăng nhập)',
        'ui-trang-chu-da-dang-nhap': 'Giao diện UI hoàn chỉnh / Màn hình trang chủ (Đã đăng nhập)',
        'ui-chi-tiet-su-kien': 'Giao diện UI hoàn chỉnh / Màn hình chi tiết sự kiện',
        'ui-chon-cho-ngoi': 'Giao diện UI hoàn chỉnh / Màn hình chọn chỗ ngồi',
        'ui-thanh-toan': 'Giao diện UI hoàn chỉnh / Màn hình thanh toán',
        'ui-thanh-toan-thanh-cong': 'Giao diện UI hoàn chỉnh / Màn hình thanh toán thành công',
        'ui-kho-ve-cua-toi': 'Giao diện UI hoàn chỉnh / Màn hình kho vé của tôi',
        'ui-chi-tiet-ve': 'Giao diện UI hoàn chỉnh / Màn hình chi tiết vé',
        'ui-kho-voucher': 'Giao diện UI hoàn chỉnh / Màn hình kho voucher',
        'styleguide': 'Hướng dẫn phong cách / Style Guide'
    };

    if (treeItems.length > 0) {
        treeItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetFile = item.getAttribute('data-file');

                // Remove active classes
                treeItems.forEach(i => i.classList.remove('active'));
                fileContents.forEach(c => c.classList.remove('active'));

                // Set active states
                item.classList.add('active');
                const targetContent = document.getElementById(`file-${targetFile}`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }

                // Update path string
                if (pathTextSpan && PATH_MAPS[targetFile]) {
                    pathTextSpan.textContent = PATH_MAPS[targetFile];
                }

                // Trigger mermaid render for diagram updates when shown
                if (window.mermaid && (targetFile.startsWith('usecase') || targetFile.startsWith('activity') || targetFile.startsWith('sequence') || targetFile.startsWith('collaboration') || targetFile.startsWith('state') || targetFile === 'erd' || targetFile.startsWith('dfd'))) {
                    window.mermaid.init(undefined, document.querySelectorAll('.mermaid'));
                }
            });
        });
    }

    // 4.1 Collapsible Sidebar Categories (tự động đóng/mở các mục)
    const treeCategories = document.querySelectorAll('.tree-category');
    if (treeCategories.length > 0) {
        treeCategories.forEach(category => {
            const categoryName = category.querySelector('.tree-category-name');
            const itemsList = category.querySelector('.tree-items');
            if (categoryName && itemsList) {
                const chevron = categoryName.querySelector('i.fa-chevron-down, i.fa-chevron-right');
                
                // Trạng thái ban đầu: chỉ mở nhóm có chứa phần tử active (.tree-item.active)
                const hasActive = category.querySelector('.tree-item.active') !== null;
                if (hasActive) {
                    itemsList.style.display = 'flex';
                    if (chevron) {
                        chevron.className = 'fas fa-chevron-down';
                    }
                } else {
                    itemsList.style.display = 'none';
                    if (chevron) {
                        chevron.className = 'fas fa-chevron-right';
                    }
                }

                // Lắng nghe sự kiện click để đóng mở
                categoryName.addEventListener('click', () => {
                    const isCollapsed = itemsList.style.display === 'none';
                    itemsList.style.display = isCollapsed ? 'flex' : 'none';
                    
                    if (chevron) {
                        chevron.className = isCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-right';
                    }
                });
            }
        });
    }


    // 5. Interactive Phone Mockup Simulator logic (inside movie-booking-detail.html)
    // 5.1 Phone Screen toggle
    const screenBtns = document.querySelectorAll('.mockup-control-btn');
    const screenSeats = document.getElementById('phone-screen-seats');
    const screenDetail = document.getElementById('phone-screen-detail');

    if (screenBtns && screenSeats && screenDetail) {
        screenBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                screenBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const targetScreen = btn.getAttribute('data-screen');
                if (targetScreen === 'detail') {
                    screenSeats.style.display = 'none';
                    screenDetail.style.display = 'flex';
                } else {
                    screenSeats.style.display = 'flex';
                    screenDetail.style.display = 'none';
                }
            });
        });
    }

    // 5.2 Seat price selector calculations
    const seats = document.querySelectorAll('.seat.available');
    const selectedCountSpan = document.getElementById('selected-seats-count');
    const totalPriceSpan = document.getElementById('total-ticket-price');
    const bookBtn = document.getElementById('phone-book-btn');
    const TICKET_PRICE = 80000;

    let selectedSeats = [];

    if (seats.length > 0) {
        seats.forEach((seat, idx) => {
            const row = String.fromCharCode(65 + Math.floor(idx / 6));
            const num = (idx % 6) + 1;
            const seatId = `${row}${num}`;
            
            seat.setAttribute('data-seat-id', seatId);
            
            seat.addEventListener('mouseenter', () => {
                if (!seat.classList.contains('selected')) {
                    seat.textContent = seatId;
                    seat.style.color = '#94a3b8';
                }
            });
            seat.addEventListener('mouseleave', () => {
                if (!seat.classList.contains('selected')) {
                    seat.textContent = '';
                }
            });

            seat.addEventListener('click', () => {
                seat.classList.toggle('selected');
                
                if (seat.classList.contains('selected')) {
                    selectedSeats.push(seatId);
                    seat.textContent = seatId;
                    seat.style.color = '#0b0f19';
                } else {
                    selectedSeats = selectedSeats.filter(s => s !== seatId);
                    seat.textContent = '';
                }

                updatePrice();
            });
        });
    }

    function updatePrice() {
        const count = selectedSeats.length;
        if (selectedCountSpan) selectedCountSpan.textContent = count;
        if (totalPriceSpan) {
            totalPriceSpan.textContent = (count * TICKET_PRICE).toLocaleString('vi-VN') + 'đ';
        }
    }

    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            if (selectedSeats.length === 0) {
                alert('Vui lòng chọn ít nhất 1 ghế để đặt vé!');
                return;
            }
            alert(`Đặt vé thành công!\nGhế: ${selectedSeats.join(', ')}\nTổng thanh toán: ${(selectedSeats.length * TICKET_PRICE).toLocaleString('vi-VN')}đ\nCảm ơn bạn đã trải nghiệm mẫu UI/UX test!`);
            
            // Reset selection
            seats.forEach(seat => {
                seat.classList.remove('selected');
                seat.textContent = '';
            });
            selectedSeats = [];
            updatePrice();
        });
    }

    // Video Demo Autocheck fallback handler
    const demoVideo = document.getElementById('vibeticket-video');
    const videoFallback = document.getElementById('video-placeholder');
    if (demoVideo && videoFallback) {
        demoVideo.addEventListener('loadedmetadata', () => {
            if (demoVideo.duration > 0) {
                demoVideo.style.display = 'block';
                videoFallback.style.display = 'none';
            }
        });
        demoVideo.addEventListener('error', () => {
            demoVideo.style.display = 'none';
            videoFallback.style.display = 'block';
        });
    }

    // Intersection Observer for Scroll Reveal animations
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Trigger animation only once
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(el => revealObserver.observe(el));
    }

    // Back to Top Button Logic
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
