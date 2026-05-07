import { Link } from "react-router-dom";
function Rescue() {
  return (
    <section
  className="container-sm my-5 p-4 bg-white rounded-4 shadow-sm"
  style={{ maxWidth: "1200px" }}
>
      <div className="text-center mb-4">
        <h2 className="fw-bold text-red">Cứu hộ xe máy 24/24</h2>
        <p className="fs-5">
            <span className="fw-bold">Hotline: </span>
            1900.277.247 - 0934.277.247
        </p>
      </div>

      <p>
        Cứu hộ xe máy 24/24 là dịch vụ cung cấp giúp đỡ các tài xế bị hỏng xe hoặc
        gặp sự cố trên đường. Với cứu hộ xe máy 24/24, người lái xe có thể yên tâm
        về việc sẽ có một đội ngũ chuyên nghiệp sẵn sàng giúp đỡ bất kỳ lúc nào
        trong ngày.
      </p>

      <p>
        Khi gặp sự cố, bạn chỉ cần gọi điện thoại tới số cứu hộ xe máy 24/24.
        Nhân viên sẽ liên lạc với bạn để tìm hiểu tình trạng và địa điểm gặp sự cố.
        Sau đó, họ sẽ cử đội ngũ kỹ thuật viên của{" "}
        <Link to="/" className="fw-bold text-decoration-none text-danger">
          Sửa Xe 247
        </Link>{" "}
        đến hiện trường để kiểm tra và sửa chữa xe máy của bạn.
      </p>

      <p>
        Các dịch vụ mà cứu hộ xe máy 24/24 có thể cung cấp bao gồm: kéo xe, thay
        bánh xe, thay dầu, sửa chữa động cơ và thay thế các linh kiện khác trên xe
        máy.
      </p>
      <p>
        Với cứu hộ xe máy 24/24, bạn sẽ không còn phải lo lắng về việc bị mắc kẹt
        trên đường hay phải tìm kiếm sự giúp đỡ từ người qua đường. Bạn sẽ luôn
        cảm thấy an tâm và yên tâm về việc có người đến giúp đỡ bất cứ khi nào bạn
        gặp sự cố với xe máy của mình.
      </p>
      <p>
        Chúng tôi cam kết đem đến cho bạn dịch vụ cứu hộ xe máy nhanh chóng,
        chuyên nghiệp và hiệu quả, giúp bạn tiếp tục hành trình một cách an toàn.
        Với giá trị cốt lõi và chiến lược tầm nhìn dài hạn trong lĩnh vực sửa chữa
        xe máy và cứu hộ xe máy. Chúng tôi luôn thực hiện đúng những cam kết sau:
      </p>

      <ul className="list-group list-group-flush mb-3">
        <li className="list-group-item">✅ Thái độ phục vụ chuyên nghiệp</li>
        <li className="list-group-item">✅ Giá thành phải chăng</li>
        <li className="list-group-item">
          ✅ Sử dụng linh kiện chính hãng và có xuất xứ rõ ràng
        </li>
        <li className="list-group-item">
          ✅ Thời gian hoàn thành sửa chữa nhanh chóng và đúng tiến độ
        </li>
        <li className="list-group-item">
          ✅ Đảm bảo chất lượng sửa chữa và bảo hành dài hạn
        </li>
        <li className="list-group-item">
          ✅ Tư vấn và giải đáp mọi thắc mắc của khách hàng về quá trình sửa chữa
        </li>
        <li className="list-group-item">
          ✅ Tạo sự tin tưởng và hài lòng tuyệt đối cho khách hàng
        </li>
      </ul>
      <img src="/assets/Rescue.jpg" alt="Rescue" className="d-block mx-auto img-fluid" style={{ maxWidth: "100%", height: "auto" }}/>
    </section>
  );
}

export default Rescue;
