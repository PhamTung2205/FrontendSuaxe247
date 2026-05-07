import UserInfor from "../components/Profile/UserInfor";
import UserVehicle from "../components/Profile/UserVehicle";

function Profile() {
  return (
    <div className="container mt-5 mb-4">
      <div className="row">
        {/* Bên trái: Thông tin cá nhân */}
        <div className="col-md-5 mb-3">
              <UserInfor />
        </div>

        {/* Bên phải: Danh sách xe */}
        <div className="col-md-7 mb-3">
          <UserVehicle />
        </div>
      </div>
    </div>
  );
}

export default Profile;
