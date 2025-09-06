# Công Cụ Tạo Kịch Bản Phim Tài Liệu AI

Một công cụ mạnh mẽ được xây dựng bằng React và Gemini API để giúp các nhà làm phim và người sáng tạo nội dung nhanh chóng tạo ra các kịch bản phim tài liệu chi tiết, chuyên nghiệp theo từng phần.

## Tính Năng Nổi Bật

- **Tạo Dàn Ý Tự Động:** Chỉ cần nhập chủ đề, AI sẽ tạo ra một dàn ý chi tiết từ 8-12 phần.
- **Viết Kịch Bản Từng Phần:** Toàn quyền kiểm soát quá trình sáng tạo bằng cách tạo kịch bản cho từng phần một.
- **Quản lý Nhiều API Key:** Nhập nhiều API key Gemini để tự động luân phiên, tránh bị giới hạn yêu cầu (rate limiting) và xử lý thông minh các key đã hết hạn ngạch.
- **Lưu Trữ An Toàn:** API key được lưu trữ an toàn ngay trên trình duyệt của bạn (`localStorage`) và không bao giờ bị gửi đi nơi khác.
- **Giao Diện Trực Quan:** Dễ dàng theo dõi tiến độ, sao chép từng phần hoặc toàn bộ kịch bản, và tải về sản phẩm cuối cùng.

## Cách Hoạt Động

Công cụ này hoàn toàn chạy phía client (trên trình duyệt của bạn). Khi bạn nhập API key, chúng sẽ được lưu trữ cục bộ. Mọi yêu cầu đến Gemini API đều được thực hiện trực tiếp từ trình duyệt của bạn đến máy chủ của Google.

## Hướng Dẫn Bắt Đầu

### 1. Lấy API Key Gemini

Bạn cần có API key của riêng mình để sử dụng công cụ này.

- Truy cập **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
- Đăng nhập bằng tài khoản Google của bạn.
- Nhấp vào "**Create API key**" để tạo một key mới.
- Sao chép key bạn vừa tạo. Bạn có thể tạo nhiều key để tận dụng tính năng luân phiên.

### 2. Thiết lập trong Ứng Dụng

- Mở ứng dụng lần đầu tiên.
- Một hộp thoại sẽ hiện ra yêu cầu bạn nhập API key.
- Dán (các) API key của bạn vào ô nhập liệu, mỗi key trên một dòng riêng biệt.
- Nhấp vào "**Lưu và Bắt đầu**".

Các key của bạn sẽ được lưu lại cho những lần truy cập sau.

### 3. Tạo Kịch Bản Của Bạn

1.  **Nhập Chủ Đề:** Nhập chủ đề cho phim tài liệu của bạn vào ô và nhấp "**Tạo dàn ý**".
2.  **Xem Lại Dàn Ý:** AI sẽ tạo ra một dàn ý chi tiết.
3.  **Tạo Từng Phần:** Nhấp vào nút "**Tạo Phần X**" để AI viết kịch bản cho phần tương ứng.
4.  **Hoàn Thành:** Tiếp tục tạo cho đến khi hoàn thành tất cả các phần.
5.  **Sử Dụng Kịch Bản:** Bạn có thể sao chép từng phần, sao chép toàn bộ, hoặc tải xuống toàn bộ kịch bản dưới dạng tệp `.txt`.

---

Dự án này được tạo ra để trình diễn khả năng của Gemini API trong các ứng dụng sáng tạo nội dung chuyên nghiệp.