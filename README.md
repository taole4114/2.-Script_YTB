# Công Cụ Tạo Kịch Bản Phim Tài Liệu AI

Một công cụ mạnh mẽ được xây dựng bằng React và Gemini API để giúp các nhà làm phim và người sáng tạo nội dung nhanh chóng tạo ra các kịch bản phim tài liệu chi tiết, chuyên nghiệp theo từng phần.

## Tính Năng Nổi Bật

- **Tạo Dàn Ý Tự Động:** Chỉ cần nhập chủ đề, AI sẽ tạo ra một dàn ý chi tiết từ 8-12 phần.
- **Viết Kịch Bản Từng Phần:** Toàn quyền kiểm soát quá trình sáng tạo bằng cách tạo kịch bản cho từng phần một.
- **Hỗ trợ nhiều nhà cung cấp AI:** Tích hợp với Gemini, OpenAI, và OpenRouter.
- **Quản lý Nhiều API Key:** Nhập nhiều API key cho mỗi nhà cung cấp để tự động luân phiên, tránh bị giới hạn yêu cầu (rate limiting) và xử lý thông minh các key đã hết hạn ngạch.
- **Lưu Trữ An Toàn:** API key được lưu trữ an toàn ngay trên trình duyệt của bạn (`localStorage`) và không bao giờ bị gửi đi nơi khác.
- **Giao Diện Trực Quan:** Dễ dàng theo dõi tiến độ, sao chép từng phần hoặc toàn bộ kịch bản, và tải về sản phẩm cuối cùng.

## Cách Hoạt Động

Công cụ này hoàn toàn chạy phía client (trên trình duyệt của bạn). Khi bạn nhập API key, chúng sẽ được lưu trữ cục bộ. Mọi yêu cầu đến các API LLM đều được thực hiện trực tiếp từ trình duyệt của bạn đến máy chủ của nhà cung cấp.

## Hướng Dẫn Bắt Đầu

### 1. Lấy API Keys

Bạn cần có API key của riêng mình để sử dụng công cụ này.

- **Gemini:** Truy cập **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
- **OpenAI:** Truy cập **[OpenAI Platform](https://platform.openai.com/api-keys)**.
- **OpenRouter:** Truy cập **[OpenRouter Keys](https://openrouter.ai/keys)**.

Tạo và sao chép các key bạn muốn sử dụng. Bạn có thể tạo nhiều key cho mỗi nhà cung cấp để tận dụng tính năng luân phiên.

### 2. Thiết lập trong Ứng Dụng

- Mở ứng dụng lần đầu tiên.
- Một hộp thoại sẽ hiện ra yêu cầu bạn nhập API key.
- Dán (các) API key của bạn vào ô nhập liệu tương ứng, mỗi key trên một dòng riêng biệt.
- Nhấp vào "**Lưu và Bắt đầu**".

Các key của bạn sẽ được lưu lại cho những lần truy cập sau.

### 3. Tạo Kịch Bản Của Bạn

1.  **Nhập Chủ Đề:** Nhập chủ đề cho phim tài liệu của bạn vào ô và nhấp "**Tạo dàn ý**".
2.  **Xem Lại Dàn Ý:** AI sẽ tạo ra một dàn ý chi tiết.
3.  **Tạo Từng Phần:** Nhấp vào nút "**Tạo Phần X**" để AI viết kịch bản cho phần tương ứng.
4.  **Hoàn Thành:** Tiếp tục tạo cho đến khi hoàn thành tất cả các phần.
5.  **Sử Dụng Kịch Bản:** Bạn có thể sao chép từng phần, sao chép toàn bộ, hoặc tải xuống toàn bộ kịch bản dưới dạng tệp `.txt`.

---

## Làm Việc Nhóm và Chia Sẻ Ứng Dụng

### Sử dụng GitHub để làm việc nhóm

GitHub là một công cụ tuyệt vời để lưu trữ code và cộng tác với team của bạn.

1.  **Tạo Repository:** Tạo một kho lưu trữ (repository) mới trên GitHub.
2.  **Đẩy Code:** Đẩy tất cả các file của dự án này lên repository bạn vừa tạo.
3.  **Quy trình làm việc:**
    *   Các thành viên trong team có thể `clone` repository về máy của họ.
    *   Khi muốn thay đổi, họ nên tạo một `branch` (nhánh) mới.
    *   Sau khi hoàn thành, họ `commit` và `push` nhánh đó lên GitHub.
    *   Cuối cùng, họ tạo một `Pull Request` để các thành viên khác review code trước khi gộp vào nhánh chính.

### Cách có đường link để chia sẻ ứng dụng

Đường link ví dụ của bạn (`https://ai.studio/apps/drive/...`) là một ứng dụng được triển khai (deploy) trên nền tảng **Google AI Studio**. GitHub dùng để lưu trữ code, còn Google AI Studio dùng để chạy và chia sẻ ứng dụng đó.

Để có một đường link tương tự cho team của bạn sử dụng:

1.  **Sử dụng Nền tảng phát triển:** Bạn cần sử dụng tính năng "Deploy" hoặc "Share" của nền tảng mà bạn đang phát triển ứng dụng (ví dụ: Google AI Studio). Nền tảng này sẽ tự động build và cung cấp cho bạn một đường link công khai.
2.  **GitHub không tự động chạy code:** Việc chỉ đẩy code lên GitHub sẽ không tạo ra một ứng dụng chạy được. GitHub Pages có thể làm điều này, nhưng nó yêu cầu một bước "build" để chuyển đổi code TypeScript (`.tsx`) thành JavaScript mà trình duyệt có thể hiểu. Việc thiết lập này phức tạp hơn và nằm ngoài cấu hình hiện tại của dự án.

**Tóm lại:** Hãy tiếp tục phát triển và triển khai trên nền tảng như Google AI Studio để có đường link chia sẻ, và sử dụng GitHub làm nơi lưu trữ, quản lý phiên bản và cộng tác trên code với team của bạn.
