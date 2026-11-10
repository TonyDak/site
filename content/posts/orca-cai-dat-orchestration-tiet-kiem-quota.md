Tôi từng nghĩ chia một việc cho nhiều AI sẽ giúp làm nhanh hơn. Khi thực sự dùng nhiều coding agent, điều tốn kém lại nằm ở những chỗ ít được chú ý: người điều phối đọc quá nhiều, worker phải tìm hiểu lại từ đầu, các phiên liên tục hỏi trạng thái, và cùng một lỗi được sửa đi sửa lại bởi nhiều người.

Orca giúp quản lý các phiên làm việc đó, nhưng hiệu quả còn phụ thuộc vào cách chia việc. Bài này đi từ cài đặt đến một quy trình orchestration có thể áp dụng cho dự án thật, rồi giải thích cách tôi giữ cấu hình gọn để sử dụng quota có chủ đích.

Các lệnh được đối chiếu với Orca CLI 1.4.255 trên Windows vào ngày 10/11/2026. Tên model, mức effort và một số tùy chọn có thể thay đổi theo phiên bản hoặc tài khoản; hãy kiểm tra trợ giúp của bản đang cài trước khi dùng lại ví dụ.

## 1. Orca làm gì trong quy trình phát triển phần mềm?

### Liên kết để bắt đầu

- [Tải Orca cho Windows, macOS và Linux](https://www.onorca.dev/download)
- [GitHub Releases và các bản phát hành trước](https://github.com/stablyai/orca/releases)
- [Hướng dẫn cài đặt chính thức](https://www.onorca.dev/docs/install)
- [Mã nguồn Orca trên GitHub](https://github.com/stablyai/orca)

Ảnh bìa và các ảnh bên dưới lấy từ tài liệu công khai của dự án Orca. Đây là workspace minh họa của nhà phát triển, không phải ảnh chụp các phiên làm việc riêng của tôi.

Orca là môi trường làm việc cho coding agent. Trong cùng một ứng dụng, tôi có thể mở repository, tạo workspace, chạy agent, xem diff và kiểm tra giao diện bằng trình duyệt. Một workspace có thể gắn với một Git worktree riêng để các nhánh công việc không ghi đè file của nhau.

Điểm quan trọng là phân biệt ba vai trò:

- Người điều phối hiểu mục tiêu, chọn cách chia việc và quyết định kết quả nào được nhận.
- Orca quản lý môi trường thực thi, workspace, phiên agent và kênh báo kết quả.
- Worker thực hiện một đầu việc bằng harness và công cụ của agent đó.

Tôi dùng nguyên tắc “hands, not brain”: để Orca làm phần vận hành, còn quyết định kỹ thuật thuộc về người điều phối và người dùng. Một công cụ quản lý nhiều agent không tự biết task nào đáng chia nhỏ hoặc khi nào một bản sửa đã đủ tốt.

Harness cũng là một phần của chất lượng thực thi. Claude Code, Codex hoặc các coding agent khác có cách quản lý công cụ, quyền, context và phiên riêng. Vì vậy, không nên kết luận một model trong agent sẽ có hành vi giống hệt một lời gọi API trần. Muốn so sánh hiệu quả, cần dùng cùng đầu việc và cùng tiêu chí kiểm chứng.

## 2. Cài Orca và chuẩn bị agent đầu tiên

Tải ứng dụng từ trang chính thức của Orca hoặc GitHub Releases của stablyai/orca. Chọn bộ cài phù hợp với Windows, macOS hay Linux. Trên macOS, trang tải cũng cung cấp cách cài bằng Homebrew:

```sh
brew install --cask stablyai/orca/orca
```

Với Windows, tôi dùng bản cài desktop và PowerShell. Sau khi cài, mở Orca, thêm repository cần làm việc và kiểm tra agent mình định sử dụng đã được cài, đăng nhập và có thể chạy độc lập.

Orca không thay thế tài khoản của nhà cung cấp model. Gói đăng ký, quota, quyền dùng model và một số khả năng của agent vẫn phụ thuộc vào tài khoản và harness tương ứng. Cách agent được tính quota cũng có thể khác giữa các nhà cung cấp.

Tôi thường bắt đầu bằng một agent và một repository. Chỉ thêm provider khác khi đã có nhu cầu cụ thể, thay vì cấu hình mọi thứ ngay từ đầu rồi không biết lỗi đến từ đâu.

### Đăng ký và kiểm tra CLI

Trong Orca, tìm phần Orca CLI ở Settings → General để đăng ký lệnh vào môi trường shell. Sau đó mở terminal mới và kiểm tra:

```powershell
Get-Command orca
orca --version
orca status --json
```

Nếu lệnh không tồn tại, kiểm tra lại phần đăng ký CLI và PATH. Nếu lệnh tồn tại nhưng không kết nối được runtime, kiểm tra ứng dụng Orca đang mở và CLI có trỏ đúng bản cài hay không.

Trên Linux, CLI ngoài terminal do Orca quản lý có thể mang tên orca-ide để tránh trùng với trình đọc màn hình GNOME Orca. Không sao chép nguyên lệnh Windows sang Linux mà bỏ qua khác biệt này.

## 3. Cài skill đúng phiên bản

Hai skill quan trọng nhất cho quy trình trong bài là orca-cli và orchestration. Skill đầu dành cho workspace, agent và các thao tác trong Orca; skill sau dành cho công việc cần giao, theo dõi và nhận kết quả từ worker.

Tôi ưu tiên dùng bộ skill đi kèm bản Orca đang chạy. Có thể xem kế hoạch cài trước mà chưa thay đổi gì:

```powershell
orca skills install --skill orca-cli --skill orchestration --agent claude,codex --dry-run
```

Khi danh sách đích cài phù hợp, chạy lệnh không có dry-run:

```powershell
orca skills install --skill orca-cli --skill orchestration --agent claude,codex
```

Đây là ví dụ cho hai agent. Hãy thay danh sách bằng các agent thực sự có trên máy. Skill orca-computer-use chỉ cần thêm khi muốn agent thao tác ứng dụng có giao diện; nó không phải điều kiện bắt buộc để giao task code.

Sau khi cập nhật skill hoặc hướng dẫn toàn cục, mở phiên agent mới để tránh tiếp tục dùng phần hướng dẫn đã nạp từ trước. Kiểm tra nội dung mà bản CLI hiện tại cung cấp bằng:

```powershell
orca skills get orca-cli
orca skills get orchestration
```

Nếu tài liệu trên web khác với bộ skill của bản đang cài, trước tiên kiểm tra phiên bản và trợ giúp CLI. Tôi không lấy một câu lệnh ở bài cũ rồi giả định nó còn nguyên tác dụng.

### Một lượt làm việc đầu tiên trong giao diện

![Cùng một cuộc hội thoại agent hiển thị ở giao diện chat và terminal của Orca](/blog/orca/chat-terminal.jpg "Chat và terminal là hai cách xem cùng luồng làm việc; chọn cách thuận tiện cho việc theo dõi và phản hồi.")

[Hướng dẫn Chat UI và terminal](https://www.onorca.dev/docs/agents/native-chat).

Sau khi thêm repository, chọn workspace đúng với thư mục code, mở một tab agent và chọn harness đã đăng nhập. Dùng bề mặt Chat hay Terminal tùy cách làm việc và khả năng của agent; không cần đổi cả hệ thống chỉ để thử một task.

Lượt đầu nên nhỏ và dễ xác nhận, chẳng hạn yêu cầu đọc component, chỉ ra nguyên nhân một lỗi hiển thị rồi sửa trong phạm vi đã xác định. Xem diff trước khi nhận kết quả. Với ứng dụng web, mở preview tương ứng với workspace và kiểm tra hành vi thật, không chỉ tin ảnh hoặc thông báo build thành công.

Khi đã quen luồng một agent, mới nhờ coordinator giao một phần việc cho worker. Cách này giúp phân biệt lỗi của project, lỗi đăng nhập harness và lỗi của orchestration. Tôi không dùng một task production lớn để thử đồng thời mọi tính năng mới.

## 4. Workspace hiện tại hay worktree mới?

![Tạo một worktree riêng trong Orca cạnh các phiên agent đang chạy](/blog/orca/worktrees.jpg "Mỗi nhánh công việc có workspace và agent riêng; chọn worktree khi cần tách vùng ghi file.")

[Nguồn ảnh và tài liệu worktree của Orca](https://www.onorca.dev/docs/model/worktrees).

Không phải task nào cũng cần tạo worktree. Với một thay đổi nhỏ và chỉ có một người ghi file, dùng workspace hiện tại thường ít tốn công chuẩn bị hơn. Review chỉ đọc cũng có thể chạy trong cùng workspace nếu phạm vi rõ ràng.

Tôi tạo worktree riêng khi có nhiều worker ghi vào cùng repository, khi thay đổi cần được cô lập để xem trước, hoặc khi các nhánh công việc có vòng kiểm tra riêng. Worktree tách file và nhánh Git; nó không tự giải quyết phụ thuộc giữa API, schema hoặc các quyết định kiến trúc.

Một tình huống dễ gây hiểu nhầm là nhánh mới không có những sửa đổi chưa commit của workspace gốc. Worker có thể đang nhìn một phiên bản code khác với điều coordinator vừa đọc. Khi giao việc, cần nói rõ baseline và phần thay đổi nào phải có sẵn, thay vì chỉ ghi “làm tiếp phần lúc nãy”.

Với thư mục chứa nhiều repository con, tạo worktree ở đúng repository sở hữu code. Đừng coi thư mục cha là một repo duy nhất chỉ vì nó xuất hiện như một workspace lớn trong IDE.

### Chuẩn bị môi trường cho worktree

Các file bị Git bỏ qua, như biến môi trường phát triển, thường không tự xuất hiện trong worktree mới. Ưu tiên setup script của repository để cài dependency và chuẩn bị cấu hình cần thiết.

Trong cấu hình cá nhân của tôi, coordinator được phép sao chép file env phát triển cần thiết giữa những workspace cục bộ đã được chỉ định nếu setup script chưa lo việc đó. Quyền này phải được đặt rõ, không suy ra rằng agent được tự lấy credential ở bất kỳ nơi nào.

- Chỉ cung cấp quyền và biến môi trường cần cho task.
- Dùng dữ liệu và credential dev/test khi có thể.
- Không dán secret vào brief hoặc báo cáo.
- Không commit env vào repository.
- Không lấy việc thiếu credential làm lý do để đổi test sang một chế độ giả rồi báo đã kiểm chứng live.

## 5. Tự làm, handoff hay orchestration?

Tôi phân biệt ba cách làm để tránh dùng cơ chế lớn cho một đầu việc nhỏ.

Tự làm phù hợp khi lỗi đã rõ, phạm vi hẹp và chi phí giải thích cho worker lớn hơn chi phí sửa. Đổi một label hoặc sửa vài dòng CSS thường thuộc nhóm này.

Handoff phù hợp khi tôi muốn chuyển hẳn quyền xử lý cho một agent hoặc workspace khác rồi tiếp tục làm việc ở đó. Coordinator ban đầu không cần theo dõi liên tục để thu kết quả về.

Orchestration có giám sát phù hợp khi cần một worker làm phần việc rồi báo lại, hoặc khi một mục tiêu gồm nhiều đầu việc có phụ thuộc và cần người tổng hợp. Ví dụ: giao sửa API, nhận patch và bằng chứng kiểm tra, rồi mới cập nhật giao diện dùng API đó.

Một câu giao việc rõ hơn “gọi thêm AI giúp tôi” là:

```text
Nhờ một worker review chỉ đọc phần phân quyền của endpoint này,
báo lại các vấn đề có bằng chứng từ source. Không sửa file và
không gọi database thật. Tôi sẽ quyết định bản sửa sau khi đọc kết quả.
```

Câu này xác định được đầu ra, quyền của worker và việc coordinator còn phải làm. Một brief có chữ “report back” là công việc có giám sát, không phải chuyển giao rồi thôi.

## 6. Một lượt orchestration từ đầu đến cuối

![Coordinator chia một nhiệm vụ cho các worker rồi nhận báo cáo kết quả trong Orca](/blog/orca/orchestration.jpg "Coordinator giao việc có phạm vi rõ ràng; worker thực thi và trả lại bằng chứng kiểm tra.")

[Xem hướng dẫn orchestration chính thức](https://www.onorca.dev/docs/cli/orchestration).

Tôi bắt đầu bằng kết quả người dùng cần, sau đó tìm phần có thể giao thành một đơn vị độc lập. Worker nên nhận một mục tiêu có thể kiểm chứng, không phải một danh sách mơ hồ các file để “nghiên cứu thêm”.

Các khái niệm thường gặp là Run, Task và Dispatch. Có thể hiểu Run là không gian theo dõi một mục tiêu; Task là đầu việc; Dispatch là một lần giao Task cho worker thực thi. Giữ đúng các ID giúp kết quả của một lần thử cũ không bị nhầm với lần đang chạy.

Với bản CLI được kiểm tra trong bài, đường bắt đầu gọn là worker-start. Nên để agent có skill orchestration sử dụng luồng này, đọc receipt và làm theo bước tiếp theo mà runtime trả về.

### Viết brief vào file

Tạo một file task để tránh lỗi dấu nháy khi truyền một prompt dài qua shell:

```markdown
Mục tiêu
Sửa lỗi hiển thị thông báo validation ở form tạo bài viết.

Bối cảnh đã biết
Server trả lỗi 400 hợp lệ, nhưng UI đang hiển thị lỗi chung.
Contract API hiện tại phải được giữ nguyên.

Điểm bắt đầu
app/admin/page.tsx
app/api/admin/posts/route.ts
Một form có xử lý lỗi tương tự trong repository.

Phạm vi
Sửa UI và test liên quan. Không sửa auth, schema hoặc dữ liệu thật.
Bắt đầu từ các file trên; đọc thêm caller/helper khi cần để hiểu đúng.

Hoàn thành khi
Thông báo validation đúng được hiển thị; luồng lưu thành công còn hoạt động.
Chạy check phù hợp và ghi rõ lệnh, kết quả, giới hạn chưa kiểm tra.

Báo cáo
Nêu hành vi đã sửa, file thay đổi, bằng chứng kiểm tra và việc còn lại.
Không commit hoặc push. Chỉ hỏi coordinator khi thật sự bị chặn.
```

Brief không cần kể lại cả cuộc chat. Nó cần mang theo các sự thật mà worker không nên phải tự khám phá lần nữa. Danh sách file là điểm xuất phát, không phải lệnh cấm đọc bất kỳ helper nào khác.

### Khởi động worker và đọc receipt

Đây là ví dụ dùng model Codex trong cấu hình cá nhân của tôi. Tên model phải tồn tại trong bản harness và tài khoản của người dùng:

```powershell
orca orchestration worker-start --spec-file ./tasks/fix-validation.md --worktree current --agent codex --model gpt-6.1-sol --effort medium --json
```

Đọc kết quả trả về để biết worker đã thực sự được tạo, brief có được nhận và runtime yêu cầu bước nào tiếp theo. Một lệnh khởi động thất bại không được báo thành “worker đang làm”.

Nếu cần workspace ghi file riêng, dùng chế độ tạo worktree và chọn đúng repository. Lấy ID trước thay vì đoán tên:

```powershell
orca repo list --json
orca orchestration worker-start --spec-file ./tasks/fix-validation.md --worktree new-top-level --repo id:<repo-id> --name fix-validation --agent codex --model gpt-6.1-sol --effort medium --json
```

Các chuỗi trong dấu nhỏ hơn/lớn hơn là chỗ cần thay bằng giá trị thật. Đừng chạy nguyên ví dụ với repo-id giả. Việc setup worktree phải theo khả năng của repository và hướng dẫn mà CLI hiện tại cung cấp.

### Chờ kết quả, trả lời và sửa tiếp

Sau khi giao các phần độc lập, coordinator nhường lượt và chờ thông báo hoàn thành hoặc câu hỏi. Không cần dựng vòng lặp liên tục gọi worker-list, đọc terminal rồi hỏi “xong chưa”.

Nếu worker thiếu một quyết định, nó dùng kênh ask được nêu trong preamble của lần dispatch. Coordinator trả lời qua reply, dựa trên phạm vi đã được cho phép:

```powershell
orca orchestration reply --id <message-id> --body "Giữ contract API hiện tại; chỉ sửa phần hiển thị lỗi."
```

Nếu cần chỉnh tiếp cùng một phần việc, gửi phần thay đổi vào worker đã hiểu code thay vì lập tức mở một phiên mới:

```powershell
orca orchestration send --to dispatch:<dispatch-id> --subject "Sửa tiếp validation" --body "Đã đọc diff. Hãy bổ sung trường hợp lỗi có nhiều field; giữ nguyên phạm vi còn lại."
```

Luôn đọc receipt. Cách tái sử dụng worker đã kết thúc có thể phụ thuộc phiên bản và host; khi runtime yêu cầu một bước khôi phục hoặc một lần dispatch mới, làm theo hướng dẫn đó thay vì thử lại lệnh một cách mù quáng.

## 7. Chạy song song khi nào mới đáng?

Song song hữu ích khi các phần có thể được làm và kiểm tra độc lập. Tôi thường xem ba điều: mỗi worker có đầu ra riêng không, có giẫm file nhau không, và các phần dùng chung đã được chốt chưa.

Ví dụ một tính năng có thể tách thành cập nhật tài liệu, viết bộ test cho contract đã xác định, và triển khai một thành phần UI độc lập. Ngược lại, nếu API còn đang đổi tên field, giao đồng thời frontend dựa vào field đó dễ tạo nhiều vòng sửa lại.

Một quy trình hợp lý có thể là:

```text
Chốt contract và tiêu chí hoàn thành
              |
       +------+------+
       |             |
   Worker API    Worker UI
       |             |
       +------+------+
              |
   Kiểm tra tích hợp và nhận kết quả
```

Đây là sơ đồ phụ thuộc, không phải yêu cầu luôn mở hai worker. Nếu task nhỏ đến mức coordinator làm xong trước khi worker đọc brief, thêm song song có thể khiến tổng thời gian và quota tăng.

Mặc định của tôi là một worker. Chỉ tăng số lượng khi lợi ích rõ, quota có đủ dư và việc tổng hợp không trở thành một dự án khác. Một người ghi file trong workspace hiện tại là lựa chọn dễ kiểm soát; nhiều người ghi vào cùng repo thường cần worktree tách biệt.

## 8. Giữ policy điều phối mỏng

Sai lầm tôi từng gặp là biến policy thành một tài liệu dài, lặp lại toàn bộ skill và ra luật cho mọi tình huống. Worker vốn đã có harness riêng; quá nhiều chỉ dẫn trùng nhau vừa tăng context vừa dễ mâu thuẫn.

Tôi dùng ba lớp: hướng dẫn bền của repository, skill đi kèm Orca, và một policy cá nhân ngắn cho quyết định điều phối. Policy cá nhân tập trung vào model được phép dùng, quota, worktree, quyền thay đổi và cách nhận kết quả.

Ví dụ dưới đây là mẫu để điều chỉnh theo môi trường của từng người, không phải cấu hình mặc định mà Orca tự ép thực thi:

```markdown
# Orca coordination policy

- Coordinator quyết định; worker thực thi qua harness của chính agent.
- Task nhỏ làm trực tiếp khi briefing và review tốn hơn việc sửa.
- Mặc định một worker. Song song khi các phần độc lập và contract đã chốt.
- Một người ghi file trong workspace hiện tại; tách worktree khi có ghi song song.
- Chọn model theo yêu cầu; chọn effort thấp nhất vẫn giải quyết task đáng tin cậy.
- Chỉ dùng model/agent có trong danh sách cho phép của người dùng.
- Kiểm tra quota trước dispatch; số đo lỗi là chưa biết, không phải còn quota.
- Không dispatch dưới ngưỡng dự phòng đã đặt cho bucket liên quan.
- Không tự thử lại khi hết quota hoặc bị rate-limit.
- Tối đa một lần thử lại tự động cho lỗi hạ tầng tạm thời có bằng chứng.
- Dùng lại session phù hợp; gửi delta thay vì chép lại toàn bộ brief.
- Chờ sự kiện hoàn thành/câu hỏi; không polling trạng thái liên tục.
- Setup repo chuẩn bị env dev/test; chỉ copy cục bộ theo quyền đã cho.
- Không đưa secret vào brief, log hoặc source được commit.
- Đọc diff và kiểm tra bằng chứng. Chạy lại check khi thiếu, mâu thuẫn hoặc rủi ro cao.
- Auth, bảo mật, migration và public API cần một lượt review độc lập phù hợp.
- Không tự commit/push, reset thay đổi của user hoặc ghi dữ liệu thật ngoài phạm vi.
- Báo rõ kết quả, check đã chạy và giới hạn chưa kiểm chứng.
```

File này có thể đặt ở đường dẫn cá nhân rồi được tham chiếu từ hướng dẫn toàn cục của agent. Trong repository, AGENTS.md hoặc CLAUDE.md chỉ cần chỉ rõ khi nào đọc policy; không cần chép toàn bộ policy vào mọi dự án.

Nếu một worker đã nhận preamble có Task ID và Dispatch ID, nó cần làm theo hợp đồng dispatch đó. Tránh để worker tự đóng vai một coordinator mới chỉ vì gặp hướng dẫn điều phối trong repository.

## 9. Chọn model và effort theo loại việc

Effort cao không phải chế độ mặc định để bảo đảm chất lượng. Nó phù hợp khi task cần suy luận nhiều; với một thay đổi cơ học đã rõ, chi phí thêm có thể không mang lại kết quả tốt hơn.

- Đổi tên, sửa text, chỉnh định dạng hoặc thay đổi nhỏ có ví dụ sẵn: bắt đầu bằng model nhanh và effort thấp.
- Tính năng hoặc bug thông thường có nhiều caller: chọn cấu hình trung bình và một brief rõ.
- Auth, concurrency, migration hoặc lỗi khó tái hiện: ưu tiên model có năng lực phù hợp và ngân sách suy luận đủ.
- Review: giới hạn đầu vào vào patch, caller và tiêu chí cần kiểm tra; không bắt reviewer xây lại toàn bộ thiết kế.
- Thiết kế trực quan: đánh giá cả công cụ xem ảnh, vòng phản hồi và khả năng kiểm tra giao diện, không chỉ tên model.

Tôi ghi danh sách model được phép dùng trong policy, còn lệnh cụ thể được kiểm tra bằng công cụ của provider và trợ giúp của Orca. Không nên chép tên model từ một bài hướng dẫn rồi mặc định tài khoản nào cũng có quyền dùng.

Ví dụ với Codex gpt-6.1-sol trong môi trường tôi đang dùng, tôi cho phép low, medium và high: bắt đầu low cho chỉnh sửa cơ học, medium cho một luồng tính năng thông thường, high cho vấn đề cần phân tích sâu. Đây là cấu hình cá nhân, không phải bảng xếp hạng model hay bảo đảm về giá. Với provider khác, giữ cùng cách chọn theo task nhưng kiểm tra lại tên model, effort và bucket quota thực tế.

Một điểm dễ nhầm: khác tên agent chưa chắc khác nhà cung cấp model. Hai harness cùng chạy model của một hãng không tạo ra sự độc lập giống như hai model khác hãng. Khi cần review khác vendor, xét model thực sự đang dùng.

Nếu coordinator thuộc vendor khác với worker, chính coordinator có thể làm lượt review độc lập phù hợp. Không nhất thiết phải trả thêm chi phí cho một worker reviewer chỉ để đủ số lượng vai trò.

## 10. Quota bị tiêu ở đâu?

Chi phí không chỉ nằm ở worker viết code. Tôi tính cả phần coordinator, context worker phải đọc, số lượt gọi công cụ, thời gian chờ và công sức tổng hợp kết quả.

Việc chép nguyên cuộc chat sang worker không làm context trở nên miễn phí. Worker vẫn phải xử lý phần được đưa sang. Tái sử dụng session có thể giảm việc đọc lại, nhưng không có nghĩa provider luôn tính quota giống nhau hoặc cache luôn còn hiệu lực.

Tôi tránh quy đổi máy móc số token thành phần trăm gói đăng ký. Input token, cached input, output token, giới hạn cửa sổ và credit của provider là những thông tin khác nhau. Một con số token cộng dồn của nhiều lượt cũng không phải lượng nội dung duy nhất được tạo mới trong lần trả lời cuối.

Orca có màn hình usage để quan sát các provider được hỗ trợ. Không phải provider nào cũng cung cấp cùng loại số liệu. Thiếu dữ liệu phải hiển thị là không rõ, không được hiểu thành còn 100%.

### Những quy tắc quota tôi thấy hữu ích

- Chừa dự phòng cho task dài, việc kiểm tra và vòng sửa cuối; đừng chỉ nhìn đủ quota để khởi động.
- Kiểm tra bucket liên quan đến model, không chỉ tổng tài khoản.
- Khi bị rate-limit hoặc hết quota, dừng retry tự động và quyết định lại cách làm.
- Chỉ dùng nhiều provider khi phù hợp với task hoặc nhu cầu review, không chia đều công việc một cách máy móc.
- Không mở nhiều worker khi chưa đọc được quota và chưa biết chi phí vận hành của task.

Trong policy cá nhân, tôi dùng ngưỡng không dispatch khi bucket cần dùng còn dưới 3%, và có thể dùng lại số đo quota chưa quá 15 phút. Đây là lựa chọn vận hành của tôi, không phải ngưỡng mặc định hay bảo đảm của Orca. Với việc dài, ngưỡng dự phòng phải cao hơn.

Tôi có script kiểm tra quota riêng trong môi trường cá nhân. Script đó không phải thành phần mặc định tự xuất hiện sau khi cài Orca. Nếu muốn dùng cách tương tự, cần kiểm tra nguồn dữ liệu, tài khoản nào được đọc và hành vi khi provider trả lỗi; đừng sao chép một đường dẫn script không tồn tại trên máy mình.

## 11. Giảm context mà không làm worker mất phương hướng

Một brief quá ngắn chỉ chuyển công tìm hiểu sang worker. Một brief quá dài lại bắt worker đọc những quyết định không liên quan. Tôi cố giữ phần giao việc đủ trả lời: làm gì, bắt đầu ở đâu, đã biết gì, không được phá điều gì và kiểm tra bằng cách nào.

Khi cần mở một phiên coordinator mới, tôi bàn giao trạng thái công việc thay vì lịch sử hội thoại. Một bản bàn giao hữu ích có thể ngắn như sau:

```text
Mục tiêu: sửa validation ở form tạo bài.
Đã xong: server contract giữ nguyên; UI đã hiển thị lỗi theo field.
Đang chạy: worker <dispatch-id> bổ sung test cho nhiều field.
Code: workspace/branch cụ thể, diff chưa commit.
Quyết định đã chốt: không đổi auth, không ghi DB thật.
Bằng chứng: lệnh lint đã qua; integration chưa chạy.
Việc tiếp theo: đọc kết quả worker, đối chiếu diff rồi kiểm tra luồng lưu.
```

Tôi không ép worker bàn giao ở một mốc token cứng chỉ vì một phiên trước từng quá dài. Chuyển phiên có giá của nó: worker mới phải hiểu lại code và trạng thái. Ranh giới một phase hoặc một đầu việc hoàn chỉnh thường là lúc bàn giao dễ kiểm soát hơn.

Kết quả từ worker cũng nên gọn nhưng có bằng chứng. “Đã xong hết” không giúp coordinator nhận patch. Một báo cáo tốt nêu thay đổi hành vi, file chính, lệnh kiểm tra, kết quả và điều chưa thử; log dài chỉ đọc thêm khi có một vấn đề cần giải thích.

## 12. Review và tích hợp mà không làm lại toàn bộ công việc

Tôi bắt đầu từ diff và bằng chứng worker đưa, không đọc lại mọi file mà worker từng mở. Cần xem cả thay đổi staged, unstaged và file mới chưa track; chỉ nhìn phần đã commit có thể bỏ sót phần thực sự sẽ được giao lại.

Với thay đổi nhỏ, bằng chứng kiểm tra đầy đủ có thể đủ để nhận kết quả sau khi đọc diff. Với auth, bảo mật, migration, concurrency và public API, tôi dành một lượt review tập trung vào boundary và regression, đồng thời chạy những check quan trọng trên trạng thái tích hợp.

Review độc lập không đồng nghĩa bắt mọi reviewer chạy toàn bộ bộ test một lần nữa. Việc chạy lại có giá trị khi xác nhận đúng patch, khi bằng chứng thiếu hoặc mâu thuẫn, hoặc khi rủi ro đòi hỏi. Nếu code thay đổi sau lượt kiểm tra, phải đánh giá check nào cần chạy lại.

Không coi báo cáo worker là quyền tự commit, push hoặc ghi dữ liệu thật. Những thao tác đó phải nằm trong phạm vi người dùng đã giao. Khi gặp conflict, đọc và giải quyết có chủ đích; không reset cây làm việc của người dùng để làm cho quá trình tích hợp trông đơn giản hơn.

## 13. Khi worker tắt, im lặng hoặc bị chặn

Một cửa sổ đóng không tự chứng minh task đã hoàn thành. Cần phân biệt kết quả worker_done, câu hỏi đang chờ, escalation, lỗi khởi động và thao tác đóng từ bên ngoài.

Khi cần chẩn đoán, dùng ID của lần dispatch thực sự đã nhận:

```powershell
orca orchestration worker-show --dispatch <dispatch-id> --json
orca orchestration worker-read --dispatch <dispatch-id> --limit 50 --json
```

Không lặp những lệnh này liên tục để thay cho cơ chế thông báo. Cũng không gửi phím vào terminal của worker để điều khiển lén một phiên đang có lifecycle do orchestration quản lý; dùng send hoặc reply đúng loại thông điệp.

Nếu muốn giữ worker mở để xem hoặc làm tiếp, kiểm tra tùy chọn keep-open của bản đang cài:

```powershell
orca orchestration worker-start --help
```

Lần khởi động có thể dùng keep-open khi nhu cầu giữ phiên đã rõ. Các tùy chọn tự đóng worker và tên mục Settings có thể đổi theo phiên bản. Đừng khẳng định mọi trường hợp worker tắt đều do một tùy chọn cụ thể nếu chưa đọc trạng thái và log.

Tôi cho phép tối đa một lần thử lại tự động với lỗi hạ tầng tạm thời có bằng chứng. Hết quota và rate-limit thuộc nhóm phải quyết định lại, không phải lý do để tiếp tục bắn cùng một yêu cầu. Trước khi thử lại một lần khởi động có kết quả không rõ, phải kiểm tra receipt và hướng khôi phục để không tạo trùng worker.

## 14. Đo hiệu quả bằng công việc đã hoàn thành

Để biết orchestration có thực sự giúp mình hay không, tôi chọn vài task đại diện và so sánh cách làm trực tiếp với cách có coordinator và worker. Không cần chạy hai phương án cho mọi task trong dự án; chỉ cần đủ trường hợp để nhận ra chi phí nào đang lặp lại.

Những thứ cần ghi lại gồm thời gian đến bản sửa đầu tiên, thời gian đến khi check đạt, số vòng sửa lại, số worker được mở và phần quota còn lại ở đúng bucket. Với bài toán chất lượng, cần cùng tiêu chí chấp nhận; hoàn thành nhanh nhưng làm sai contract không phải là một kết quả tốt hơn.

Tôi không đưa ra một phần trăm tiết kiệm cố định. Repo, task, provider, model và độ dài phiên đều ảnh hưởng. Thước đo hữu ích là có bao nhiêu việc hoàn thành và đã kiểm chứng trên lượng quota, thời gian và công sức thực sự bỏ ra.

## 15. Cấu hình khởi đầu tôi khuyên dùng

- Một coordinator và mặc định một worker.
- Chỉ mở thêm worker khi công việc độc lập, quota rõ và đầu ra có thể kiểm chứng.
- Cây worker nông nếu chưa có lý do cần worker tạo helper; đây là lựa chọn cấu hình, không phải khẳng định về mặc định của mọi bản Orca.
- Một người ghi file trong workspace hiện tại; worktree riêng cho các nhánh ghi song song.
- Policy ngắn, hướng dẫn repo rõ, skill đúng phiên bản.
- Model và effort chọn theo độ khó; không dùng mức cao nhất cho mọi việc.
- Trả lời câu hỏi thực sự bị chặn, gửi delta vào phiên phù hợp, chờ sự kiện thay vì polling.
- Giữ các bước kiểm tra cần thiết và bỏ việc kiểm tra lặp không mang lại bằng chứng mới.
- Review độc lập cho boundary rủi ro; quản lý quyền, env và dữ liệu thật tách khỏi mong muốn chạy nhanh.

Tôi muốn Orca giúp giảm ma sát giữa các phiên làm việc. Khi phải tốn quá nhiều lượt để quản lý chính các agent, tôi xem lại cách chia task và brief trước khi thêm một lớp orchestration khác.

## Nguồn tham khảo và phạm vi kiểm chứng

Bài viết tổng hợp kinh nghiệm vận hành của tôi và đối chiếu với CLI đang cài. Các ví dụ task dùng dữ liệu minh họa; không chứa nội dung riêng của dự án, credential hoặc transcript hội thoại. Các khuyến nghị về quota và policy là lựa chọn thực hành, không phải một benchmark công bố của nhà phát triển Orca.

- [Mã nguồn Orca](https://github.com/stablyai/orca)
- [Tải ứng dụng](https://www.onorca.dev/download)
- [Hướng dẫn cài đặt](https://www.onorca.dev/docs/install)
- [CLI](https://www.onorca.dev/docs/cli/overview)
- [Orchestration](https://www.onorca.dev/docs/cli/orchestration)
- [Worktree](https://www.onorca.dev/docs/model/worktrees)
- [Theo dõi usage](https://www.onorca.dev/docs/agents/usage-tracking)

Orca phát hành thường xuyên. Trước khi áp dụng vào môi trường mới, kiểm tra version, trợ giúp lệnh, skill đi kèm và một task nhỏ trên repository thử nghiệm. Việc một command hợp lệ không đồng nghĩa toàn bộ luồng đã được kiểm chứng trên mọi máy, provider hay remote runtime.

Ảnh minh họa được cập nhật ngày 11/11/2026 từ [repository chính thức của Orca](https://github.com/stablyai/orca), theo giấy phép MIT. Phiên bản giao diện của bạn có thể khác. Ảnh được lưu cùng website để không phụ thuộc hotlink từ nguồn ngoài.
